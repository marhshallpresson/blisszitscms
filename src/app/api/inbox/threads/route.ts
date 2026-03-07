import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { listInboxThreads, updateInboxThread } from '@/lib/server/inbox-service';

const QuerySchema = z.object({
  workspaceId: z.string().min(1),
});

const UpdateSchema = z.object({
  workspaceId: z.string().min(1),
  threadId: z.string().min(1),
  status: z.enum(['open', 'pending', 'done']).optional(),
  assignee: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  read: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const parsed = QuerySchema.parse({
      workspaceId: request.nextUrl.searchParams.get('workspaceId'),
    });
    const threads = await listInboxThreads({
      db: getAdminDb(),
      workspaceId: parsed.workspaceId,
      userId,
    });
    return NextResponse.json({ threads }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = UpdateSchema.parse(await request.json());
    const thread = await updateInboxThread({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      userId,
      threadId: body.threadId,
      status: body.status,
      assignee: body.assignee,
      tags: body.tags,
      read: body.read,
    });
    return NextResponse.json({ thread }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
