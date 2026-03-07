import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { getNetworkCapability, normalizeNetworkKey, type NetworkKey } from '@/lib/network-capabilities';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { writeAuditLog } from '@/lib/server/audit-log';
import { getConnectorAdapter } from '@/lib/connectors/registry';
import { getCredential, saveCredential } from '@/lib/server/token-store';

type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';
type ContentStatus =
  | 'idea'
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed';

type PublishJobStatus =
  | 'queued'
  | 'claimed'
  | 'processing'
  | 'published'
  | 'retrying'
  | 'failed'
  | 'dead_letter';

type ContentVariant = {
  network?: string;
};

type ContentDoc = {
  title?: string;
  dueDate?: string;
  scheduledAt?: string;
  approvalStatus?: ApprovalStatus;
  status?: ContentStatus;
  variants?: ContentVariant[];
  publishedAt?: string;
};

type SocialAccountDoc = {
  network?: string;
  status?: 'connected' | 'expiring' | 'expired' | 'revoked' | 'error' | 'disconnected';
  integrationMode?: 'metadata_only' | 'oauth';
  credentialRef?: string;
  accountExternalId?: string;
};

type PublishJobDoc = {
  contentItemId?: string;
  network?: string;
  status?: PublishJobStatus;
  scheduledFor?: string;
  nextAttemptAt?: string;
  attemptCount?: number;
  maxAttempts?: number;
  idempotencyKey?: string;
};

const DEFAULT_MAX_ATTEMPTS = 3;

const parseIso = (value?: string): string => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const normalizeApprovalStatus = (value?: string): ApprovalStatus => {
  if (value === 'pending' || value === 'approved' || value === 'rejected') return value;
  return 'none';
};

const normalizeContentStatus = (value?: string): ContentStatus => {
  const raw = value?.trim().toLowerCase();
  if (
    raw === 'idea' ||
    raw === 'draft' ||
    raw === 'in_progress' ||
    raw === 'review' ||
    raw === 'approved' ||
    raw === 'scheduled' ||
    raw === 'published' ||
    raw === 'failed'
  ) {
    return raw;
  }
  if (raw === 'in progress') return 'in_progress';
  if (raw === 'for review') return 'review';
  return 'draft';
};

const updateContentPublishStatus = async (
  db: Firestore,
  workspaceId: string,
  contentItemId: string
): Promise<void> => {
  const jobsSnapshot = await db
    .collection(`workspaces/${workspaceId}/publish_jobs`)
    .where('contentItemId', '==', contentItemId)
    .get();

  if (jobsSnapshot.empty) return;

  const statuses = jobsSnapshot.docs.map((doc) => (doc.data() as PublishJobDoc).status || 'queued');
  const isComplete = statuses.every((status) => status === 'published' || status === 'failed' || status === 'dead_letter');
  if (!isComplete) return;

  const hasSuccess = statuses.some((status) => status === 'published');
  await db.collection(`workspaces/${workspaceId}/content`).doc(contentItemId).set(
    {
      status: hasSuccess ? 'published' : 'failed',
      publishedAt: hasSuccess ? new Date().toISOString() : FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

export const schedulePublishJobs = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
  contentItemId: string;
  scheduledFor?: string;
}) => {
  const { db, workspaceId, userId, contentItemId, scheduledFor } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const contentRef = db.collection(`workspaces/${workspaceId}/content`).doc(contentItemId);
  const contentSnap = await contentRef.get();
  if (!contentSnap.exists) {
    throw new Error('Content item not found.');
  }

  const content = contentSnap.data() as ContentDoc;
  const approvalStatus = normalizeApprovalStatus(content.approvalStatus);
  const status = normalizeContentStatus(content.status);
  if (approvalStatus !== 'approved' && status !== 'scheduled') {
    throw new Error('Content must be approved before scheduling.');
  }

  const variants = Array.isArray(content.variants) ? content.variants : [];
  const candidateNetworks = variants
    .map((variant) => normalizeNetworkKey(variant.network))
    .filter((network): network is NetworkKey => Boolean(network));

  const accountSnap = await db.collection(`workspaces/${workspaceId}/social_accounts`).get();
  const fallbackNetworks = accountSnap.docs
    .map((doc) => normalizeNetworkKey((doc.data() as SocialAccountDoc).network))
    .filter((network): network is NetworkKey => Boolean(network));

  const targetNetworks = Array.from(new Set(candidateNetworks.length > 0 ? candidateNetworks : fallbackNetworks));
  if (targetNetworks.length === 0) {
    throw new Error('Connect at least one social account or add a platform variant before scheduling.');
  }

  const scheduleIso = parseIso(scheduledFor || content.scheduledAt || content.dueDate);
  const existingJobs = await db.collection(`workspaces/${workspaceId}/publish_jobs`).get();
  const existingIdempotency = new Set(
    existingJobs.docs.map((doc) => ((doc.data() as PublishJobDoc).idempotencyKey || '').trim()).filter(Boolean)
  );

  let created = 0;
  for (const network of targetNetworks) {
    const idempotencyKey = `${contentItemId}:${network}:${scheduleIso.slice(0, 16)}`;
    if (existingIdempotency.has(idempotencyKey)) continue;

    await db.collection(`workspaces/${workspaceId}/publish_jobs`).add({
      workspaceId,
      contentItemId,
      network,
      status: 'queued',
      scheduledFor: scheduleIso,
      nextAttemptAt: scheduleIso,
      attemptCount: 0,
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
      idempotencyKey,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    created += 1;
  }

  await contentRef.set(
    {
      status: 'scheduled',
      approvalStatus: 'approved',
      scheduledAt: scheduleIso,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await writeAuditLog(db, {
    workspaceId,
    actorId: userId,
    action: 'publish.schedule',
    entityType: 'content_item',
    entityId: contentItemId,
    outcome: 'success',
    details: { createdJobs: created, scheduledFor: scheduleIso, networks: targetNetworks },
  });

  return { createdJobs: created, scheduledFor: scheduleIso, networks: targetNetworks };
};

const claimJob = async (db: Firestore, workspaceId: string, jobId: string): Promise<PublishJobDoc | null> => {
  const jobRef = db.collection(`workspaces/${workspaceId}/publish_jobs`).doc(jobId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(jobRef);
    if (!snap.exists) return null;
    const data = snap.data() as PublishJobDoc;
    const status = data.status || 'queued';
    if (status !== 'queued' && status !== 'retrying') return null;

    tx.update(jobRef, {
      status: 'claimed',
      updatedAt: FieldValue.serverTimestamp(),
    });
    return data;
  });
};

const processClaimedJob = async (
  db: Firestore,
  workspaceId: string,
  jobId: string,
  jobData: PublishJobDoc
): Promise<'published' | 'retrying' | 'failed' | 'dead_letter'> => {
  const jobRef = db.collection(`workspaces/${workspaceId}/publish_jobs`).doc(jobId);
  const nextAttempt = (jobData.attemptCount ?? 0) + 1;
  const maxAttempts = jobData.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const networkKey = normalizeNetworkKey(jobData.network);
  const capability = getNetworkCapability(networkKey ?? undefined);

  await jobRef.set(
    {
      status: 'processing',
      attemptCount: nextAttempt,
      updatedAt: FieldValue.serverTimestamp(),
      lastError: '',
    },
    { merge: true }
  );

  if (!networkKey || !capability?.canPublish) {
    await jobRef.set(
      {
        status: 'failed',
        errorCode: 'NETWORK_NOT_SUPPORTED',
        lastError: 'Publishing is not enabled for this network in the current phase.',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return 'failed';
  }

  const accountSnap = await db.collection(`workspaces/${workspaceId}/social_accounts`).get();
  const connectedAccount = accountSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as SocialAccountDoc) }))
    .find(
      (account) =>
        normalizeNetworkKey(account.network) === networkKey &&
        account.status === 'connected' &&
        account.integrationMode === 'oauth' &&
        Boolean(account.credentialRef)
    );

  if (!connectedAccount) {
    const exhausted = nextAttempt >= maxAttempts;
    const retryAt = new Date(Date.now() + Math.min(15, nextAttempt * 2) * 60 * 1000).toISOString();
    const nextStatus: PublishJobStatus = exhausted ? 'dead_letter' : 'retrying';
    await jobRef.set(
      {
        status: nextStatus,
        errorCode: 'ACCOUNT_NOT_CONNECTED',
        lastError: 'Connected OAuth account not found for this network.',
        nextAttemptAt: exhausted ? null : retryAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return nextStatus;
  }

  const adapter = getConnectorAdapter(networkKey);
  if (!adapter) {
    await jobRef.set(
      {
        status: 'failed',
        errorCode: 'ADAPTER_NOT_IMPLEMENTED',
        lastError: `No connector adapter implemented for ${networkKey}.`,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return 'failed';
  }

  const contentSnap = await db.collection(`workspaces/${workspaceId}/content`).doc(jobData.contentItemId || '').get();
  const content = (contentSnap.exists ? contentSnap.data() : null) as
    | {
        caption?: string;
        script?: string;
        title?: string;
        variants?: Array<{ network?: string; text?: string; mediaUrl?: string }>;
      }
    | null;
  const variants = Array.isArray(content?.variants) ? content?.variants : [];
  const variant = variants.find((entry) => normalizeNetworkKey(entry.network) === networkKey);
  const publishText =
    variant?.text ||
    content?.caption ||
    content?.script ||
    content?.title ||
    `Scheduled post ${jobData.contentItemId || ''}`.trim();

  const credentialRef = connectedAccount.credentialRef as string;
  let credential = await getCredential(db, credentialRef);

  try {
    const publishResult = await adapter.publishPost({
      workspaceId,
      contentItemId: jobData.contentItemId || '',
      network: networkKey,
      text: publishText,
      mediaUrl: variant?.mediaUrl,
      accessToken: credential.accessToken,
      accountId: connectedAccount.accountExternalId || credential.accountId,
    });

    await jobRef.set(
      {
        status: 'published',
        publishedAt: publishResult.publishedAt,
        providerRequestId: publishResult.providerRequestId || '',
        externalPostId: publishResult.externalPostId,
        errorCode: '',
        lastError: '',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return 'published';
  } catch (publishError) {
    const message = publishError instanceof Error ? publishError.message : 'Provider publish failed';
    const shouldRefresh =
      message.toLowerCase().includes('token') || message.toLowerCase().includes('unauthorized') || message.includes('401');

    if (shouldRefresh) {
      try {
        const refreshed = await adapter.refreshToken({
          refreshToken: credential.refreshToken,
          accessToken: credential.accessToken,
        });
        await saveCredential(
          db,
          {
            ...credential,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || credential.refreshToken,
            expiresAt: refreshed.expiresAt || credential.expiresAt,
            scope: refreshed.scope || credential.scope,
          },
          credentialRef
        );
        credential = {
          ...credential,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || credential.refreshToken,
          expiresAt: refreshed.expiresAt || credential.expiresAt,
        };

        const retryPublish = await adapter.publishPost({
          workspaceId,
          contentItemId: jobData.contentItemId || '',
          network: networkKey,
          text: publishText,
          mediaUrl: variant?.mediaUrl,
          accessToken: credential.accessToken,
          accountId: connectedAccount.accountExternalId || credential.accountId,
        });

        await jobRef.set(
          {
            status: 'published',
            publishedAt: retryPublish.publishedAt,
            providerRequestId: retryPublish.providerRequestId || '',
            externalPostId: retryPublish.externalPostId,
            errorCode: '',
            lastError: '',
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return 'published';
      } catch (refreshError) {
        const refreshMessage = refreshError instanceof Error ? refreshError.message : 'Token refresh failed';
        await jobRef.set(
          {
            status: 'failed',
            errorCode: 'PUBLISH_FAILED',
            lastError: refreshMessage,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return 'failed';
      }
    }

    await jobRef.set(
      {
        status: 'failed',
        errorCode: 'PUBLISH_FAILED',
        lastError: message,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return 'failed';
  }
};

export const runDuePublishJobsForWorkspace = async (input: {
  db: Firestore;
  workspaceId: string;
  limit?: number;
  actorId?: string;
}) => {
  const { db, workspaceId, limit = 25, actorId = 'system' } = input;

  const jobsSnapshot = await db
    .collection(`workspaces/${workspaceId}/publish_jobs`)
    .where('status', 'in', ['queued', 'retrying'])
    .orderBy('scheduledFor', 'asc')
    .limit(Math.max(1, Math.min(limit, 100)))
    .get();

  const now = Date.now();
  let processed = 0;
  let published = 0;
  let retried = 0;
  let failed = 0;
  let deadLetter = 0;

  for (const jobSnap of jobsSnapshot.docs) {
    const claimedData = await claimJob(db, workspaceId, jobSnap.id);
    if (!claimedData) continue;

    const dueAt = new Date(claimedData.nextAttemptAt || claimedData.scheduledFor || new Date().toISOString()).getTime();
    if (Number.isFinite(dueAt) && dueAt > now) {
      await db
        .collection(`workspaces/${workspaceId}/publish_jobs`)
        .doc(jobSnap.id)
        .set(
          {
            status: claimedData.status || 'queued',
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      continue;
    }

    processed += 1;
    const result = await processClaimedJob(db, workspaceId, jobSnap.id, claimedData);
    if (result === 'published') published += 1;
    if (result === 'retrying') retried += 1;
    if (result === 'failed') failed += 1;
    if (result === 'dead_letter') deadLetter += 1;

    if (claimedData.contentItemId) {
      await updateContentPublishStatus(db, workspaceId, claimedData.contentItemId);
    }
  }

  await writeAuditLog(db, {
    workspaceId,
    actorId,
    action: 'publish.run_due',
    entityType: 'publish_job',
    outcome: 'success',
    details: { processed, published, retried, failed, deadLetter },
  });

  return { processed, published, retried, failed, deadLetter };
};

export const retryPublishJob = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
  jobId: string;
}) => {
  const { db, workspaceId, userId, jobId } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const jobRef = db.collection(`workspaces/${workspaceId}/publish_jobs`).doc(jobId);
  const snap = await jobRef.get();
  if (!snap.exists) throw new Error('Publish job not found.');
  const data = snap.data() as PublishJobDoc;
  const status = data.status || 'queued';
  if (status !== 'failed' && status !== 'dead_letter') {
    throw new Error('Only failed/dead-letter jobs can be retried.');
  }

  await jobRef.set(
    {
      status: 'retrying',
      nextAttemptAt: new Date().toISOString(),
      lastError: '',
      errorCode: '',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await writeAuditLog(db, {
    workspaceId,
    actorId: userId,
    action: 'publish.retry',
    entityType: 'publish_job',
    entityId: jobId,
    outcome: 'success',
  });

  return { jobId, status: 'retrying' as const };
};
