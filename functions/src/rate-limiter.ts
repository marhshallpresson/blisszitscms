import * as admin from 'firebase-admin';

// Initialize admin if needed (though it should be done in index.ts)
const db = admin.firestore();

export async function checkAndUpdateRateLimit(
  uid: string,
  platform: string,
  cost = 1
): Promise<void> {
  const ref = db.doc(`users/${uid}/rateLimits/${platform}`);

  await db.runTransaction(async tx => {
    const doc = await tx.get(ref);
    const now = Date.now();
    const hourStart = now - (now % 3600000);

    const data = doc.exists ? doc.data()! : { calls: 0, windowStart: hourStart };

    if (data.windowStart < hourStart) {
      data.calls = 0;
      data.windowStart = hourStart;
    }

    const limits: Record<string, number> = {
      facebook: 200,
      instagram: 240,
      threads: 250,
      linkedin: 700,
    };

    const effectiveLimit = platform === 'threads' ? limits[platform]! / 24 : limits[platform]!;

    if (data.calls + cost > (effectiveLimit || 200)) {
      const resetIn = Math.ceil((data.windowStart + 3600000 - now) / 1000);
      throw new Error(`Rate limit reached for ${platform}. Resets in ${resetIn}s.`);
    }

    tx.set(ref, { calls: data.calls + cost, windowStart: data.windowStart });
  });
}
