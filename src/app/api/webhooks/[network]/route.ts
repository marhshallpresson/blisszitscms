import { NextRequest, NextResponse } from 'next/server';
import type { Firestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { ingestInboundWebhookMessage } from '@/lib/server/inbox-service';
import { verifyWebhookSignature } from '@/lib/server/webhook-signature';

const NetworkSchema = z.enum(['meta', 'linkedin']);

const NormalizedEventSchema = z.object({
  workspaceId: z.string().min(1).optional(),
  accountExternalId: z.string().min(1),
  threadId: z.string().min(1),
  user: z.string().min(1),
  text: z.string().min(1),
  avatar: z.string().url().optional(),
  timestamp: z.string().datetime().optional(),
});

type NormalizedWebhookEvent = z.infer<typeof NormalizedEventSchema>;

const WebhookBodySchema = z.object({
  events: z.array(NormalizedEventSchema).min(1),
});

const getWebhookSecret = (network: 'meta' | 'linkedin'): string | null => {
  if (network === 'meta') return process.env.META_WEBHOOK_SECRET || null;
  return process.env.LINKEDIN_WEBHOOK_SECRET || null;
};

const verifyRequest = (network: 'meta' | 'linkedin', body: string, request: NextRequest): boolean => {
  const secret = getWebhookSecret(network);
  if (!secret) return false;

  if (network === 'meta') {
    return verifyWebhookSignature({
      body,
      signatureHeader: request.headers.get('x-hub-signature-256'),
      secret,
      mode: 'meta_sha256',
    });
  }

  const linkedInSignature =
    request.headers.get('x-linkedin-signature') ||
    request.headers.get('x-li-signature') ||
    request.headers.get('x-linkedin-signature-256');
  return verifyWebhookSignature({
    body,
    signatureHeader: linkedInSignature,
    secret,
    mode: 'hex_sha256',
  });
};

const toIso = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    return undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Meta timestamps are often milliseconds.
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    const parsed = new Date(ms);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const extractMetaEvents = (payload: unknown): NormalizedWebhookEvent[] => {
  const root = asRecord(payload);
  if (!root) return [];

  const events: NormalizedWebhookEvent[] = [];
  const entries = asArray(root.entry);

  for (const entry of entries) {
    const entryRec = asRecord(entry);
    if (!entryRec) continue;

    const accountExternalId = normalizeText(entryRec.id);
    const entryTime = toIso(entryRec.time);

    const messaging = asArray(entryRec.messaging);
    for (const messageEvent of messaging) {
      const msgRec = asRecord(messageEvent);
      if (!msgRec) continue;
      const senderId = normalizeText(asRecord(msgRec.sender)?.id);
      const recipientId = normalizeText(asRecord(msgRec.recipient)?.id) || accountExternalId;
      const message = asRecord(msgRec.message);
      const text = normalizeText(message?.text);
      if (!senderId || !recipientId || !text) continue;
      const mid = normalizeText(message?.mid);
      const timestamp = toIso(msgRec.timestamp) || entryTime;
      events.push({
        accountExternalId: recipientId,
        threadId: mid || `${senderId}:${recipientId}`,
        user: senderId,
        text,
        timestamp,
      });
    }

    const changes = asArray(entryRec.changes);
    for (const changeEvent of changes) {
      const change = asRecord(changeEvent);
      if (!change) continue;
      const value = asRecord(change.value);
      if (!value) continue;
      const text =
        normalizeText(value.text) ||
        normalizeText(value.message) ||
        normalizeText(value.comment_text);
      const from = asRecord(value.from);
      const fromId = normalizeText(from?.id) || normalizeText(value.sender_id);
      const threadId =
        normalizeText(value.conversation_id) ||
        normalizeText(value.comment_id) ||
        normalizeText(value.post_id);
      if (!accountExternalId || !fromId || !threadId || !text) continue;
      events.push({
        accountExternalId,
        threadId,
        user: fromId,
        text,
        timestamp: entryTime || toIso(value.created_time) || toIso(value.timestamp),
      });
    }
  }

  return events;
};

const extractLinkedInEvents = (payload: unknown): NormalizedWebhookEvent[] => {
  const root = asRecord(payload);
  if (!root) return [];

  const events: NormalizedWebhookEvent[] = [];
  const candidates = [
    ...asArray(root.events),
    ...asArray(root.elements),
    ...asArray(root.records),
  ];

  for (const candidate of candidates) {
    const rec = asRecord(candidate);
    if (!rec) continue;

    const accountExternalId =
      normalizeText(rec.accountExternalId) ||
      normalizeText(rec.organization) ||
      normalizeText(rec.organizationId) ||
      normalizeText(rec.author);
    const actor =
      normalizeText(rec.actor) ||
      normalizeText(rec.member) ||
      normalizeText(rec.from) ||
      normalizeText(rec.user);
    const text =
      normalizeText(rec.text) ||
      normalizeText(rec.message) ||
      normalizeText(rec.comment) ||
      normalizeText(asRecord(rec.payload)?.text);
    const threadId =
      normalizeText(rec.threadId) ||
      normalizeText(rec.conversationId) ||
      normalizeText(rec.messageId) ||
      normalizeText(rec.activityUrn) ||
      normalizeText(rec.urn);

    if (!accountExternalId || !actor || !text || !threadId) continue;

    events.push({
      accountExternalId: accountExternalId.replace(/^urn:li:(organization|person):/i, ''),
      threadId,
      user: actor,
      text,
      timestamp: toIso(rec.timestamp) || toIso(rec.createdAt),
    });
  }

  return events;
};

const resolveWorkspaceIdForEvent = async (
  db: Firestore,
  event: NormalizedWebhookEvent,
  network: 'meta' | 'linkedin'
): Promise<string | null> => {
  if (event.workspaceId) return event.workspaceId;

  const scopeNetwork = network === 'linkedin' ? ['linkedin'] : ['facebook', 'instagram'];
  const snap = await db
    .collectionGroup('social_accounts')
    .where('accountExternalId', '==', event.accountExternalId)
    .where('network', 'in', scopeNetwork)
    .limit(1)
    .get();
  if (snap.empty) return null;

  const data = snap.docs[0].data() as { workspaceId?: string };
  return data.workspaceId || null;
};

const parseNormalizedEvents = (network: 'meta' | 'linkedin', payload: unknown): NormalizedWebhookEvent[] => {
  const normalized = WebhookBodySchema.safeParse(payload);
  if (normalized.success) {
    return normalized.data.events;
  }
  return network === 'meta' ? extractMetaEvents(payload) : extractLinkedInEvents(payload);
};

export async function GET(request: NextRequest, context: { params: Promise<{ network: string }> }) {
  const params = await context.params;
  const parsedNetwork = NetworkSchema.safeParse(params.network);
  if (!parsedNetwork.success) {
    return NextResponse.json({ error: 'Unsupported webhook network.' }, { status: 404 });
  }

  if (parsedNetwork.data !== 'meta') {
    return NextResponse.json({ error: 'Verification handshake is only used for meta webhook endpoint.' }, { status: 400 });
  }

  const verifyToken = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken || !challenge || !expectedToken || verifyToken !== expectedToken) {
    return NextResponse.json({ error: 'Meta webhook verification failed.' }, { status: 401 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: NextRequest, context: { params: Promise<{ network: string }> }) {
  try {
    const params = await context.params;
    const parsedNetwork = NetworkSchema.parse(params.network);
    const rawBody = await request.text();

    if (!verifyRequest(parsedNetwork, rawBody, request)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as unknown;
    const parsedEvents = parseNormalizedEvents(parsedNetwork, payload);
    if (parsedEvents.length === 0) {
      return NextResponse.json({ status: 'ignored', reason: 'no_supported_events' }, { status: 202 });
    }

    const db = getAdminDb();
    let ingested = 0;
    let skipped = 0;

    for (const event of parsedEvents) {
      const workspaceId = await resolveWorkspaceIdForEvent(db, event, parsedNetwork);
      if (!workspaceId) {
        skipped += 1;
        continue;
      }

      await ingestInboundWebhookMessage({
        db,
        workspaceId,
        network: parsedNetwork === 'meta' ? 'Facebook/Instagram' : 'LinkedIn',
        accountExternalId: event.accountExternalId,
        threadExternalId: event.threadId,
        user: event.user,
        text: event.text,
        avatar: event.avatar,
        receivedAt: event.timestamp,
      });
      ingested += 1;
    }

    return NextResponse.json({ status: 'ok', ingested, skipped }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
