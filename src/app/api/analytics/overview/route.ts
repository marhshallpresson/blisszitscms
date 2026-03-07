import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { listAnalyticsOverview } from '@/lib/server/analytics-service';

const QuerySchema = z.object({
  workspaceId: z.string().min(1),
  network: z.string().optional(),
  days: z.coerce.number().int().min(3).max(30).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const query = QuerySchema.parse({
      workspaceId: request.nextUrl.searchParams.get('workspaceId'),
      network: request.nextUrl.searchParams.get('network') ?? 'Overall',
      days: request.nextUrl.searchParams.get('days') ?? 7,
    });

    const points = await listAnalyticsOverview({
      db: getAdminDb(),
      workspaceId: query.workspaceId,
      userId,
      network: query.network,
      days: query.days,
    });

    return NextResponse.json({ points }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
