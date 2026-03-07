import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';

const DeleteWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = DeleteWorkspaceSchema.parse(await request.json());
    const db = getAdminDb();
    await assertWorkspaceOwner(db, body.workspaceId, userId);

    const workspaceRef = db.collection('workspaces').doc(body.workspaceId);

    const [
      contentSnap,
      ideasSnap,
      socialSnap,
      jobsSnap,
      inboxThreadsSnap,
      analyticsSnap,
      auditSnap,
    ] = await Promise.all([
      db.collection(`workspaces/${body.workspaceId}/content`).get(),
      db.collection(`workspaces/${body.workspaceId}/ideas`).get(),
      db.collection(`workspaces/${body.workspaceId}/social_accounts`).get(),
      db.collection(`workspaces/${body.workspaceId}/publish_jobs`).get(),
      db.collection(`workspaces/${body.workspaceId}/inbox_threads`).get(),
      db.collection(`workspaces/${body.workspaceId}/analytics_snapshots`).get(),
      db.collection(`workspaces/${body.workspaceId}/audit_logs`).get(),
    ]);

    for (const contentDoc of contentSnap.docs) {
      const commentsSnap = await contentDoc.ref.collection('comments').get();
      for (const commentDoc of commentsSnap.docs) {
        await commentDoc.ref.delete();
      }
      await contentDoc.ref.delete();
    }

    for (const threadDoc of inboxThreadsSnap.docs) {
      const messageSnap = await threadDoc.ref.collection('messages').get();
      for (const messageDoc of messageSnap.docs) {
        await messageDoc.ref.delete();
      }
      await threadDoc.ref.delete();
    }

    for (const docSnap of ideasSnap.docs) await docSnap.ref.delete();
    for (const docSnap of socialSnap.docs) await docSnap.ref.delete();
    for (const docSnap of jobsSnap.docs) await docSnap.ref.delete();
    for (const docSnap of analyticsSnap.docs) await docSnap.ref.delete();
    for (const docSnap of auditSnap.docs) await docSnap.ref.delete();

    await workspaceRef.delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
