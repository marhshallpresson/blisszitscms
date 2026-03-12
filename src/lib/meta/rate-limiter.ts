import { adminDb } from '@/lib/firebase/admin';

export async function checkAndUpdateRateLimit(
  uid: string,
  platform: string,
  cost = 1
): Promise<void> {
  const ref = adminDb.doc(`users/${uid}/rateLimits/${platform}`);

  await adminDb.runTransaction(async tx => {
    const doc = await tx.get(ref);
    const now = Date.now();
    const hourStart = now - (now % 3600000); // Start of the current hour in milliseconds

    const data = doc.exists ? doc.data()! : { calls: 0, windowStart: hourStart };

    // Reset window if over an hour old
    if (data.windowStart < hourStart) {
      data.calls = 0;
      data.windowStart = hourStart;
    }

    const limits: Record<string, number> = {
      facebook: 200, // calls/hour
      instagram: 240, // calls/hour
      threads: 250, // posts/day (adjusted for 24 hours below)
      linkedin: 700, // calls/day (example, adjust based on LinkedIn docs)
    };

    // Adjust Threads limit for hourly check
    const effectiveLimit = platform === 'threads' ? limits[platform]! / 24 : limits[platform]!;
    // For LinkedIn, if using daily limit, this hourly check might be too granular.
    // Consider adding a separate daily check for platforms with daily limits if needed.

    if (data.calls + cost > (effectiveLimit || 200)) {
      const resetIn = Math.ceil((data.windowStart + 3600000 - now) / 1000);
      throw new Error(`Rate limit reached for ${platform}. Resets in ${resetIn}s.`);
    }

    tx.set(ref, { calls: data.calls + cost, windowStart: data.windowStart });
  });
}
