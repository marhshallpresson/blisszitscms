import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { retryPublishJob } from '@/lib/server/publishing-service';
import { toApiError } from '@/lib/server/api-response';

const RetrySchema = z.object({
  workspaceId: z.string().min(1),
  jobId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = RetrySchema.parse(await request.json());

    const result = await retryPublishJob({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      userId,
      jobId: body.jobId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
