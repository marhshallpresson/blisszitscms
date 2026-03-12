import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { encryptToken, decryptToken } from './crypto';

const GRAPH = 'https://graph.facebook.com/v22.0';
const LI_REFRESH = 'https://www.linkedin.com/oauth/v2/accessToken';
const THREADS_REFRESH = 'https://graph.threads.net/access_token';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const refreshExpiredTokens = functions.scheduler.onSchedule(
  { schedule: '0 2 * * *', timeZone: 'UTC' }, // 2 AM daily
  async () => {
    const threshold = Date.now() + SEVEN_DAYS;

    const snapshot = await db.collectionGroup('metaTokens')
      .where('expiresAt', '<', threshold)
      .get();

    const liSnapshot = await db.collectionGroup('linkedinTokens')
      .where('expiresAt', '<', threshold)
      .get();

    await Promise.allSettled([
      ...snapshot.docs.map(doc => refreshMetaToken(doc)),
      ...liSnapshot.docs.map(doc => refreshLinkedInToken(doc)),
    ]);
  }
);

async function refreshMetaToken(doc: admin.firestore.QueryDocumentSnapshot) {
  const { accessToken, expiresAt, platform } = doc.data();
  const uid = doc.ref.parent.parent!.id;

  if (expiresAt < Date.now()) {
    // Expired — notify user
    await db.collection(`users/${uid}/notifications`).add({
      type: 'token_expired',
      platform,
      message: `Your ${platform} connection expired. Please reconnect.`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
    return;
  }

  const currentToken = decryptToken(accessToken);

  if (platform === 'threads') {
    const res = await fetch(`${THREADS_REFRESH}?` + new URLSearchParams({
      grant_type: 'th_refresh_token',
      access_token: currentToken,
    }));
    const { access_token, expires_in } = await res.json();
    await doc.ref.update({
      accessToken: encryptToken(access_token),
      expiresAt: Date.now() + expires_in * 1000,
      lastRefreshed: Date.now(),
    });
  } else {
    // Facebook long-lived refresh
    const res = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: currentToken,
    }));
    const { access_token, expires_in } = await res.json();
    await doc.ref.update({
      accessToken: encryptToken(access_token),
      expiresAt: Date.now() + expires_in * 1000,
      lastRefreshed: Date.now(),
    });
  }
}

async function refreshLinkedInToken(doc: admin.firestore.QueryDocumentSnapshot) {
  const { accessToken, expiresAt } = doc.data();
  const uid = doc.ref.parent.parent!.id;

  if (expiresAt < Date.now()) {
    await db.collection(`users/${uid}/notifications`).add({
      type: 'token_expired',
      platform: 'linkedin',
      message: 'Your LinkedIn connection expired. Please reconnect.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
    return;
  }

  // LinkedIn uses refresh tokens (60-day sliding window)
  // Note: Refresh token must be stored at initial exchange
  const { refreshToken } = doc.data();
  if (!refreshToken) return;

  const res = await fetch(LI_REFRESH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptToken(refreshToken),
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });
  const { access_token, expires_in, refresh_token } = await res.json();
  await doc.ref.update({
    accessToken: encryptToken(access_token),
    refreshToken: encryptToken(refresh_token),
    expiresAt: Date.now() + expires_in * 1000,
    lastRefreshed: Date.now(),
  });
}
