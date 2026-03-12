import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateAiReply } from '@/lib/ai/auto-responder';
import { replyToFbComment } from '@/lib/meta/facebook';
import { replyToIgComment } from '@/lib/meta/instagram';
import { decryptToken } from '@/lib/crypto';
import { ingestInboundWebhookMessage } from '@/lib/server/inbox-service';

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const body = await req.json();
  const { entry } = body;

  for (const item of entry) {
    const { id: pageId, changes, messaging } = item;

    if (changes) {
      for (const change of changes) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          await handleFbComment(pageId, change.value);
        }
      }
    }

    if (messaging) {
      for (const event of messaging) {
        if (event.message && !event.message.is_echo) {
          await handleMessengerDM(pageId, event);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleFbComment(pageId: string, value: any) {
  // Find all workspaces that have this page connected
  const socialAccountsSnap = await adminDb.collectionGroup('social_accounts')
    .where('network', '==', 'facebook')
    .where('accountExternalId', '==', pageId)
    .get();

  if (socialAccountsSnap.empty) return;

  for (const accountDoc of socialAccountsSnap.docs) {
    const workspaceId = accountDoc.data().workspaceId;
    const uid = (await adminDb.doc(`workspaces/${workspaceId}`).get()).data()?.ownerId;
    if (!uid) continue;

    const aiResult = await generateAiReply({
      platform: 'facebook_comment',
      message: value.message,
      postContext: value.post?.message,
      senderName: value.from?.name,
      uid,
    });

    const { threadId } = await ingestInboundWebhookMessage({
      db: adminDb,
      workspaceId,
      network: 'facebook',
      accountExternalId: pageId,
      threadExternalId: value.post_id, // FB comments grouped by post
      user: value.from?.name || 'Unknown',
      text: value.message,
      receivedAt: new Date().toISOString(),
    });

    // Store AI suggestion in the specific message if needed
    // For now, let's just log it or update the thread
    if (aiResult.reply) {
      await adminDb.doc(`workspaces/${workspaceId}/inbox_threads/${threadId}`).update({
        aiSuggestedReply: aiResult.reply,
        aiConfidence: aiResult.confidence,
      });
    }

    // Auto-respond if enabled in workspace/user settings
    const settingsDoc = await adminDb.doc(`users/${uid}/settings/autoRespond`).get();
    const autoEnabled = settingsDoc.data()?.enabled ?? false;
    const confidenceThreshold = settingsDoc.data()?.confidenceThreshold ?? 0.85;

    if (autoEnabled && !aiResult.requiresHumanReview && aiResult.confidence > confidenceThreshold) {
      const pageToken = decryptToken(accountDoc.data().accessToken);
      await replyToFbComment(value.comment_id, aiResult.reply, pageToken, true);
      // Logic to mark as replied in inbox_threads/messages...
    }
  }
}

async function handleMessengerDM(pageId: string, event: any) {
  const socialAccountsSnap = await adminDb.collectionGroup('social_accounts')
    .where('network', '==', 'facebook')
    .where('accountExternalId', '==', pageId)
    .get();

  if (socialAccountsSnap.empty) return;

  for (const accountDoc of socialAccountsSnap.docs) {
    const workspaceId = accountDoc.data().workspaceId;
    const uid = (await adminDb.doc(`workspaces/${workspaceId}`).get()).data()?.ownerId;
    if (!uid) continue;

    const messageText = event.message.text || '[Attachment]';

    const aiResult = await generateAiReply({
      platform: 'facebook_messenger',
      message: messageText,
      senderName: 'Customer', // Messenger name requires additional lookup
      uid,
    });

    const { threadId } = await ingestInboundWebhookMessage({
      db: adminDb,
      workspaceId,
      network: 'facebook',
      accountExternalId: pageId,
      threadExternalId: event.sender.id, // Group by sender for DMs
      user: 'Customer',
      text: messageText,
      receivedAt: new Date().toISOString(),
    });

    if (aiResult.reply) {
      await adminDb.doc(`workspaces/${workspaceId}/inbox_threads/${threadId}`).update({
        aiSuggestedReply: aiResult.reply,
        aiConfidence: aiResult.confidence,
      });
    }
  }
}
