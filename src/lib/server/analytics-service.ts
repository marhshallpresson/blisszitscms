import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { writeAuditLog } from '@/lib/server/audit-log';

type AnalyticsDoc = {
  network?: string;
  day?: string;
  reach?: number;
  engagement?: number;
  clicks?: number;
  followers?: number;
  estimated?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export interface AnalyticsPoint {
  name: string;
  reach: number;
  engagement: number;
  clicks: number;
  followers: number;
  estimated: boolean;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDayKey = (date: Date): string => date.toISOString().slice(0, 10);

const getDayLabel = (dayKey: string): string => {
  const date = new Date(`${dayKey}T12:00:00.000Z`);
  return dayNames[date.getUTCDay()];
};

const hash = (value: string): number => {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total = (total * 31 + value.charCodeAt(i)) % 100000;
  return total;
};

const deterministic = (seed: string, min: number, max: number): number => {
  const value = hash(seed);
  return min + (value % (max - min + 1));
};

export const syncAnalyticsDemoData = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
  network: string;
  days?: number;
}) => {
  const { db, workspaceId, userId, network, days = 7 } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const normalizedNetwork = network.trim() || 'Overall';
  const span = Math.max(3, Math.min(days, 30));
  const now = new Date();

  for (let i = span - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - i);
    const day = toDayKey(date);
    const docId = `${normalizedNetwork.toLowerCase().replace(/\s+/g, '_')}__${day}`;
    const seed = `${workspaceId}:${normalizedNetwork}:${day}`;

    await db.collection(`workspaces/${workspaceId}/analytics_snapshots`).doc(docId).set(
      {
        network: normalizedNetwork,
        day,
        reach: deterministic(`${seed}:reach`, 1200, 6200),
        engagement: deterministic(`${seed}:engagement`, 130, 980),
        clicks: deterministic(`${seed}:clicks`, 35, 340),
        followers: deterministic(`${seed}:followers`, 2, 40),
        estimated: true,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await writeAuditLog(db, {
    workspaceId,
    actorId: userId,
    action: 'analytics.sync',
    entityType: 'analytics_snapshot',
    outcome: 'success',
    details: { network: normalizedNetwork, days: span },
  });

  return { syncedDays: span, network: normalizedNetwork };
};

export const listAnalyticsOverview = async (input: {
  db: Firestore;
  workspaceId: string;
  userId: string;
  network?: string;
  days?: number;
}): Promise<AnalyticsPoint[]> => {
  const { db, workspaceId, userId, network = 'Overall', days = 7 } = input;
  await assertWorkspaceOwner(db, workspaceId, userId);

  const span = Math.max(3, Math.min(days, 30));
  const normalizedNetwork = network.trim() || 'Overall';
  const now = new Date();
  const oldestDate = new Date(now);
  oldestDate.setUTCDate(now.getUTCDate() - (span - 1));
  const oldestKey = toDayKey(oldestDate);

  const snapshot = await db
    .collection(`workspaces/${workspaceId}/analytics_snapshots`)
    .where('network', '==', normalizedNetwork)
    .where('day', '>=', oldestKey)
    .orderBy('day', 'asc')
    .get();

  const rows = new Map<string, AnalyticsDoc>();
  snapshot.forEach((docSnap) => rows.set(docSnap.id, docSnap.data() as AnalyticsDoc));

  const points: AnalyticsPoint[] = [];
  for (let i = span - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - i);
    const day = toDayKey(date);
    const docId = `${normalizedNetwork.toLowerCase().replace(/\s+/g, '_')}__${day}`;
    const data = rows.get(docId);
    points.push({
      name: getDayLabel(day),
      reach: data?.reach ?? 0,
      engagement: data?.engagement ?? 0,
      clicks: data?.clicks ?? 0,
      followers: data?.followers ?? 0,
      estimated: data?.estimated ?? true,
    });
  }

  return points;
};
