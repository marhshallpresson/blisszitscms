import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { runDuePublishJobsForWorkspace } from '@/lib/server/publishing-service';
import { toApiError } from '@/lib/server/api-response';

const RunDueSchema = z.object({
  workspaceId: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = RunDueSchema.parse(await request.json());
    const db = getAdminDb();

    await assertWorkspaceOwner(db, body.workspaceId, userId);
    const result = await runDuePublishJobsForWorkspace({
      db,
      workspaceId: body.workspaceId,
      limit: body.limit,
      actorId: userId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
