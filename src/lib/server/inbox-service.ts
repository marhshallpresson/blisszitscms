import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { writeAuditLog } from '@/lib/server/audit-log';

export type InboxThreadStatus = 'open' | 'pending' | 'done';
export type InboxMessageDirection = 'inbound' | 'outbound';

type InboxThreadDoc = {
  platform?: string;
  user?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string | Timestamp;
  read?: boolean;
  status?: InboxThreadStatus;
  assignee?: string;
  tags?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type InboxMessageDoc = {
  text?: string;
  direction?: InboxMessageDirection;
  timestamp?: string | Timestamp;
  author?: string;
  createdAt?: Timestamp;
};

const toIso = (value?: string | Timestamp): string => {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  return value.toDate().toISOString();
};

export interface InboxMessageRecord {
  id: string;
  text: string;
  direction: InboxMessageDirection;
  timestamp: string;
  author: string;
}

export interface InboxThreadRecord {
  id: string;
  platform: string;
  user: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  read: boolean;
  status: InboxThreadStatus;
  assignee: string;
  tags: string[];
  messages: InboxMessageRecord[];
}

export interface WebhookInboundMessageInput {
  db: Firestore;
  workspaceId: string;
  network: string;
  accountExternalId: string;
  threadExternalId: string;
  user: string;
  text: string;
  avatar?: string;
  receivedAt?: string;
}

const normalizeStatus = (status?: string): InboxThreadStatus => {
  if (status === 'pending' || status === 'done') return status;
  return 'open';
};

const sanitizeTags = (tags?: string[]): string[] => {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
        .slice(0, 12)
    )
  );
};

const getThreadMessages = async (
  db: Firestore,
  workspaceId: string,
  threadId: string
): Promise<InboxMessageRecord[]> => {
  const snapshot = await db
    .collection(`workspaces/${workspaceId}/inbox_threads/${threadId}/messages`)
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as InboxMessageDoc;
    return {
      id: docSnap.id,
      text: data.text || '',
      direction: data.direction === 'outbound' ? 'outbound' : 'inbound',
      timestamp: toIso(data.timestamp),
      author: data.author || 'Unknown',
    };
  });
};

export const listInboxThreads = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
}): Promise<InboxThreadRecord[]> => {
  const { db, workspaceId, userId } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const threadSnapshot = await db
    .collection(`workspaces/${workspaceId}/inbox_threads`)
    .orderBy('updatedAt', 'desc')
    .get();

  const threads: InboxThreadRecord[] = [];
  for (const docSnap of threadSnapshot.docs) {
    const data = docSnap.data() as InboxThreadDoc;
    const messages = await getThreadMessages(db, workspaceId, docSnap.id);

    threads.push({
      id: docSnap.id,
      platform: data.platform || 'Other',
      user: data.user || 'Unknown',
      avatar: data.avatar,
      lastMessage: data.lastMessage || messages[messages.length - 1]?.text || '',
      timestamp: toIso(data.timestamp),
      read: Boolean(data.read),
      status: normalizeStatus(data.status),
      assignee: data.assignee || 'Unassigned',
      tags: sanitizeTags(data.tags),
      messages,
    });
  }

  return threads;
};

export const updateInboxThread = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
  threadId: string;
  status?: InboxThreadStatus;
  assignee?: string;
  tags?: string[];
  read?: boolean;
}): Promise<InboxThreadRecord> => {
  const { db, workspaceId, userId, threadId, status, assignee, tags, read } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const threadRef = db.collection(`workspaces/${workspaceId}/inbox_threads`).doc(threadId);
  const threadSnap = await threadRef.get();
  if (!threadSnap.exists) throw new Error('Inbox thread not found.');

  await threadRef.set(
    {
      status: status ?? (threadSnap.data() as InboxThreadDoc).status ?? 'open',
      assignee: assignee ?? (threadSnap.data() as InboxThreadDoc).assignee ?? 'Unassigned',
      tags: tags ? sanitizeTags(tags) : (threadSnap.data() as InboxThreadDoc).tags ?? [],
      read: typeof read === 'boolean' ? read : (threadSnap.data() as InboxThreadDoc).read ?? false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await writeAuditLog(db, {
    workspaceId,
    actorId: userId,
    action: 'inbox.thread.update',
    entityType: 'inbox_thread',
    entityId: threadId,
    outcome: 'success',
    details: { status, assignee, tags, read },
  });

  const threads = await listInboxThreads({ db, workspaceId, userId });
  const updated = threads.find((thread) => thread.id === threadId);
  if (!updated) throw new Error('Inbox thread not found after update.');
  return updated;
};

export const replyToInboxThread = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
  threadId: string;
  text: string;
  author: string;
}): Promise<InboxThreadRecord> => {
  const { db, workspaceId, userId, threadId, text, author } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Reply text is required.');

  const threadRef = db.collection(`workspaces/${workspaceId}/inbox_threads`).doc(threadId);
  const threadSnap = await threadRef.get();
  if (!threadSnap.exists) throw new Error('Inbox thread not found.');

  const messageRef = db.collection(`workspaces/${workspaceId}/inbox_threads/${threadId}/messages`).doc();
  const nowIso = new Date().toISOString();
  await messageRef.set({
    text: trimmed,
    direction: 'outbound',
    timestamp: nowIso,
    author,
    createdAt: FieldValue.serverTimestamp(),
  });

  await threadRef.set(
    {
      lastMessage: trimmed,
      timestamp: nowIso,
      read: true,
      status: (threadSnap.data() as InboxThreadDoc).status === 'done' ? 'pending' : (threadSnap.data() as InboxThreadDoc).status,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await writeAuditLog(db, {
    workspaceId,
    actorId: userId,
    action: 'inbox.thread.reply',
    entityType: 'inbox_thread',
    entityId: threadId,
    outcome: 'success',
    details: { length: trimmed.length },
  });

  const threads = await listInboxThreads({ db, workspaceId, userId });
  const updated = threads.find((thread) => thread.id === threadId);
  if (!updated) throw new Error('Inbox thread not found after reply.');
  return updated;
};

export const syncInboxDemoData = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
}): Promise<{ upsertedThreads: number }> => {
  const { db, workspaceId, userId } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const seeds = [
    {
      platform: 'Instagram',
      user: 'creative_mind',
      status: 'open' as InboxThreadStatus,
      assignee: 'Unassigned',
      tags: ['brand'],
      message: 'Loved your latest post about AI.',
    },
    {
      platform: 'TikTok',
      user: 'tiktok_fan_99',
      status: 'pending' as InboxThreadStatus,
      assignee: 'Ariana',
      tags: ['support'],
      message: 'Can you share the template for this?',
    },
    {
      platform: 'LinkedIn',
      user: 'Sarah Jenkins',
      status: 'done' as InboxThreadStatus,
      assignee: 'Marcus',
      tags: ['sales'],
      message: 'Great insights on social strategy.',
    },
  ];

  let upsertedThreads = 0;
  for (const seed of seeds) {
    const querySnapshot = await db
      .collection(`workspaces/${workspaceId}/inbox_threads`)
      .where('platform', '==', seed.platform)
      .where('user', '==', seed.user)
      .limit(1)
      .get();

    const threadRef = querySnapshot.empty
      ? db.collection(`workspaces/${workspaceId}/inbox_threads`).doc()
      : querySnapshot.docs[0].ref;

    const nowIso = new Date().toISOString();
    await threadRef.set(
      {
        platform: seed.platform,
        user: seed.user,
        lastMessage: seed.message,
        timestamp: nowIso,
        read: false,
        status: seed.status,
        assignee: seed.assignee,
        tags: seed.tags,
        createdAt: querySnapshot.empty ? FieldValue.serverTimestamp() : querySnapshot.docs[0].data().createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const messageSnapshot = await threadRef.collection('messages').limit(1).get();
    if (messageSnapshot.empty) {
      await threadRef.collection('messages').add({
        text: seed.message,
        direction: 'inbound',
        timestamp: nowIso,
        author: seed.user,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    upsertedThreads += 1;
  }

  await writeAuditLog(db, {
    workspaceId,
    actorId: userId,
    action: 'inbox.sync',
    entityType: 'inbox_thread',
    outcome: 'success',
    details: { upsertedThreads },
  });

  return { upsertedThreads };
};

const normalizeLabel = (value: string): string => value.trim().toLowerCase();

export const ingestInboundWebhookMessage = async (input: WebhookInboundMessageInput): Promise<{ threadId: string }> => {
  const { db, workspaceId, network, accountExternalId, threadExternalId, user, text, avatar, receivedAt } = input;
  const messageText = text.trim();
  if (!messageText) throw new Error('Inbound webhook message text is required.');

  const socialAccountSnap = await db
    .collection(`workspaces/${workspaceId}/social_accounts`)
    .where('accountExternalId', '==', accountExternalId)
    .limit(1)
    .get();
  if (socialAccountSnap.empty) {
    throw new Error('Social account not found for webhook event.');
  }

  const platform = network.trim() || 'Unknown';
  const externalThreadKey = `${normalizeLabel(platform)}:${threadExternalId.trim()}`;

  const existingThread = await db
    .collection(`workspaces/${workspaceId}/inbox_threads`)
    .where('externalThreadKey', '==', externalThreadKey)
    .limit(1)
    .get();

  const threadRef = existingThread.empty
    ? db.collection(`workspaces/${workspaceId}/inbox_threads`).doc()
    : existingThread.docs[0].ref;
  const nowIso = receivedAt || new Date().toISOString();

  await threadRef.set(
    {
      platform,
      user: user.trim() || 'Unknown',
      avatar: avatar?.trim() || undefined,
      lastMessage: messageText,
      timestamp: nowIso,
      read: false,
      status: 'open',
      assignee: existingThread.empty ? 'Unassigned' : ((existingThread.docs[0].data() as InboxThreadDoc).assignee || 'Unassigned'),
      tags: existingThread.empty ? [] : sanitizeTags((existingThread.docs[0].data() as InboxThreadDoc).tags),
      externalThreadKey,
      accountExternalId,
      createdAt: existingThread.empty ? FieldValue.serverTimestamp() : ((existingThread.docs[0].data() as InboxThreadDoc).createdAt || FieldValue.serverTimestamp()),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await threadRef.collection('messages').add({
    text: messageText,
    direction: 'inbound',
    timestamp: nowIso,
    author: user.trim() || 'Unknown',
    createdAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(db, {
    workspaceId,
    actorId: 'webhook_worker',
    action: 'inbox.webhook.ingest',
    entityType: 'inbox_thread',
    entityId: threadRef.id,
    outcome: 'success',
    details: {
      network: platform,
      accountExternalId,
      externalThreadKey,
    },
  });

  return { threadId: threadRef.id };
};
