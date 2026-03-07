import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { syncAnalyticsDemoData } from '@/lib/server/analytics-service';

const SyncSchema = z.object({
  workspaceId: z.string().min(1),
  network: z.string().optional().default('Overall'),
  days: z.number().int().min(3).max(30).optional().default(7),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = SyncSchema.parse(await request.json());
    const result = await syncAnalyticsDemoData({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      userId,
      network: body.network,
      days: body.days,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
