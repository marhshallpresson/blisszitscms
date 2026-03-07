import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireInternalKey } from '@/lib/server/api-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { runDuePublishJobsForWorkspace } from '@/lib/server/publishing-service';
import { toApiError } from '@/lib/server/api-response';

const ExecuteSchema = z.object({
  workspaceId: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    requireInternalKey(request);
    const body = ExecuteSchema.parse(await request.json());

    const result = await runDuePublishJobsForWorkspace({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      limit: body.limit,
      actorId: 'internal_worker',
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
