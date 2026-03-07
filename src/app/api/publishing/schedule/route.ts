import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { schedulePublishJobs } from '@/lib/server/publishing-service';
import { toApiError } from '@/lib/server/api-response';

const ScheduleSchema = z.object({
  workspaceId: z.string().min(1),
  contentItemId: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = ScheduleSchema.parse(await request.json());

    const result = await schedulePublishJobs({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      userId,
      contentItemId: body.contentItemId,
      scheduledFor: body.scheduledFor,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
