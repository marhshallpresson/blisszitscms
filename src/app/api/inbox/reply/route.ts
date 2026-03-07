import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { replyToInboxThread } from '@/lib/server/inbox-service';

const ReplySchema = z.object({
  workspaceId: z.string().min(1),
  threadId: z.string().min(1),
  text: z.string().min(1),
  author: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = ReplySchema.parse(await request.json());
    const thread = await replyToInboxThread({
      db: getAdminDb(),
      workspaceId: body.workspaceId,
      userId,
      threadId: body.threadId,
      text: body.text,
      author: body.author,
    });
    return NextResponse.json({ thread }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
