import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireInternalKey } from '@/lib/server/api-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { writeAuditLog } from '@/lib/server/audit-log';
import { toApiError } from '@/lib/server/api-response';
import { syncAnalyticsDemoData } from '@/lib/server/analytics-service';

const AnalyticsSyncSchema = z.object({
  workspaceId: z.string().min(1),
  network: z.string().min(1),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    requireInternalKey(request);
    const body = AnalyticsSyncSchema.parse(await request.json());
    const db = getAdminDb();
    const workspaceSnap = await db.collection('workspaces').doc(body.workspaceId).get();
    if (!workspaceSnap.exists) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const ownerId = workspaceSnap.data()?.ownerId as string | undefined;
    if (!ownerId) {
      return NextResponse.json({ error: 'Workspace owner missing.' }, { status: 400 });
    }

    const result = await syncAnalyticsDemoData({
      db,
      workspaceId: body.workspaceId,
      userId: ownerId,
      network: body.network,
      days: 7,
    });

    await writeAuditLog(db, {
      workspaceId: body.workspaceId,
      actorId: 'internal_worker',
      action: 'analytics.sync',
      entityType: 'analytics',
      outcome: 'success',
      details: {
        network: body.network,
        from: body.from,
        to: body.to,
        implementation: 'seed_sync',
        syncedDays: result.syncedDays,
      },
    });

    return NextResponse.json(
      {
        status: 'completed',
        workspaceId: body.workspaceId,
        network: body.network,
        syncedDays: result.syncedDays,
      },
      { status: 200 }
    );
  } catch (error) {
    return toApiError(error);
  }
}
