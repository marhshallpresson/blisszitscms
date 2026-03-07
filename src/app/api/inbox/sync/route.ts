import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { syncInboxDemoData } from '@/lib/server/inbox-service';

const SyncSchema = z.object({
  workspaceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = SyncSchema.parse(await request.json());
    const result = await syncInboxDemoData({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      userId,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
