import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { publishToFbPage } from './lib/meta/facebook';
import { publishToInstagram } from './lib/meta/instagram';
import { publishToThreads } from './lib/meta/threads';
import { publishToLinkedIn } from './lib/linkedin/publisher';
import { decryptToken } from './crypto';

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const processScheduledPosts = functions.scheduler.onSchedule(
  { schedule: '* * * * *', timeZone: 'UTC' }, // Every minute
  async () => {
    const now = admin.firestore.Timestamp.now();
    const fiveMinAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);

    const snapshot = await db.collectionGroup('scheduledPosts')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '>=', fiveMinAgo)
      .where('scheduledAt', '<=', now)
      .limit(50)
      .get();

    await Promise.allSettled(snapshot.docs.map(processPost));
  }
);

async function processPost(doc: admin.firestore.QueryDocumentSnapshot) {
  const post = doc.data();

  // Atomic lock — prevents double-publish if function runs twice
  const locked = await db.runTransaction(async tx => {
    const fresh = await tx.get(doc.ref);
    if (fresh.data()?.status !== 'scheduled') return false;
    tx.update(doc.ref, {
      status: 'publishing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  });
  if (!locked) return;

  const results = [];

  for (const target of post.targets) {
    try {
      let result: any;

      switch (target.platform) {
        case 'facebook': {
          const tokenDoc = await db.doc(`users/${post.uid}/connectedPages/${target.accountId}`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          result = await publishToFbPage(target.accountId, token, post.content);
          break;
        }
        case 'instagram': {
          const tokenDoc = await db.doc(`users/${post.uid}/metaTokens/instagram`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          result = await publishToInstagram(target.accountId, token, post.content);
          break;
        }
        case 'threads': {
          const tokenDoc = await db.doc(`users/${post.uid}/metaTokens/threads`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          result = await publishToThreads(target.accountId, token, post.content);
          break;
        }
        case 'linkedin': {
          const tokenDoc = await db.doc(`users/${post.uid}/linkedinTokens/main`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          // Find the org URN from connectedOrgs
          const orgDocId = target.accountId.replace(/:/g, '_');
          const orgDoc = await db.doc(`users/${post.uid}/connectedOrgs/${orgDocId}`).get();
          result = await publishToLinkedIn(token, {
            text: post.content.text,
            orgUrn: orgDoc.data()!.urn,
            imageBuffer: post.content.imageBuffer,
          });
          break;
        }
      }

      results.push({
        platform: target.platform,
        accountId: target.accountId,
        ...result,
        publishedAt: Date.now(),
      });

    } catch (err) {
      results.push({
        platform: target.platform,
        accountId: target.accountId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  const allFailed = results.every(r => r.error);
  await doc.ref.update({
    status: allFailed ? 'failed' : 'published',
    results,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
