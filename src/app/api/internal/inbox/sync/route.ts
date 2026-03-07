import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireInternalKey } from '@/lib/server/api-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { writeAuditLog } from '@/lib/server/audit-log';
import { toApiError } from '@/lib/server/api-response';
import { syncInboxDemoData } from '@/lib/server/inbox-service';

const InboxSyncSchema = z.object({
  workspaceId: z.string().min(1),
  network: z.string().min(1),
  since: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    requireInternalKey(request);
    const body = InboxSyncSchema.parse(await request.json());
    const db = getAdminDb();
    const workspaceSnap = await db.collection('workspaces').doc(body.workspaceId).get();
    if (!workspaceSnap.exists) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const ownerId = workspaceSnap.data()?.ownerId as string | undefined;
    if (!ownerId) {
      return NextResponse.json({ error: 'Workspace owner missing.' }, { status: 400 });
    }

    const result = await syncInboxDemoData({
      db,
      workspaceId: body.workspaceId,
      userId: ownerId,
    });

    await writeAuditLog(db, {
      workspaceId: body.workspaceId,
      actorId: 'internal_worker',
      action: 'inbox.sync',
      entityType: 'inbox',
      outcome: 'success',
      details: {
        network: body.network,
        since: body.since || null,
        implementation: 'seed_sync',
        upsertedThreads: result.upsertedThreads,
      },
    });

    return NextResponse.json(
      {
        status: 'completed',
        workspaceId: body.workspaceId,
        network: body.network,
        upsertedThreads: result.upsertedThreads,
      },
      { status: 200 }
    );
  } catch (error) {
    return toApiError(error);
  }
}
