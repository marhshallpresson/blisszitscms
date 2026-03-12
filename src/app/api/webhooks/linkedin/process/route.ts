import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateAiReply } from '@/lib/ai/auto-responder';
import { decryptToken } from '@/lib/crypto';
import { ingestInboundWebhookMessage } from '@/lib/server/inbox-service';

const LI_API = 'https://api.linkedin.com/v2';

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const payload = await req.json();
  const ownerUrn = payload.owner; // Organization URN
  const resourceUrn = payload.resource; // Comment/Post URN
  const actorUrn = payload.actor; // Person URN

  if (!ownerUrn || !resourceUrn || !actorUrn) {
    return new Response('Bad Request', { status: 400 });
  }

  // Find all workspaces that have this LinkedIn Org connected
  const socialAccountsSnap = await adminDb.collectionGroup('social_accounts')
    .where('network', '==', 'linkedin')
    .where('accountExternalId', '==', ownerUrn)
    .get();

  if (socialAccountsSnap.empty) return NextResponse.json({ ok: true });

  for (const accountDoc of socialAccountsSnap.docs) {
    const workspaceId = accountDoc.data().workspaceId;
    const uid = (await adminDb.doc(`workspaces/${workspaceId}`).get()).data()?.ownerId;
    if (!uid) continue;

    if (resourceUrn.startsWith('urn:li:comment')) {
      const accessToken = decryptToken(accountDoc.data().accessToken);
      
      // 1. Fetch the comment text and sender info from LinkedIn API
      const commentData = await fetchLinkedInComment(resourceUrn, accessToken);
      if (!commentData) continue;

      // 2. Generate AI suggestion
      const aiResult = await generateAiReply({
        platform: 'linkedin_comment',
        message: commentData.text,
        senderName: commentData.senderName,
        uid,
      });

      // 3. Ingest into Workspace Inbox
      const { threadId } = await ingestInboundWebhookMessage({
        db: adminDb,
        workspaceId,
        network: 'linkedin',
        accountExternalId: ownerUrn,
        threadExternalId: commentData.parentUrn || resourceUrn, // Group by post or thread
        user: commentData.senderName,
        text: commentData.text,
        receivedAt: new Date().toISOString(),
      });

      // 4. Store AI suggestion
      if (aiResult.reply) {
        await adminDb.doc(`workspaces/${workspaceId}/inbox_threads/${threadId}`).update({
          aiSuggestedReply: aiResult.reply,
          aiConfidence: aiResult.confidence,
          aiHumanReviewNeeded: aiResult.requiresHumanReview,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function fetchLinkedInComment(commentUrn: string, accessToken: string) {
  try {
    const encodedUrn = encodeURIComponent(commentUrn);
    const res = await fetch(`${LI_API}/comments/${encodedUrn}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    });
    const data = await res.json();
    
    // Fetch actor name
    const actorRes = await fetch(`${LI_API}/people/${encodeURIComponent(data.actor)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const actorData = await actorRes.json();

    return {
      text: data.message?.text || '',
      senderName: `${actorData.localizedFirstName} ${actorData.localizedLastName}`,
      parentUrn: data.object, // The post URN this comment belongs to
    };
  } catch (error) {
    console.error('Error fetching LinkedIn comment details:', error);
    return null;
  }
}
