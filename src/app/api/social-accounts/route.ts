import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { getNetworkCapability } from '@/lib/network-capabilities';

const CreateSchema = z.object({
  workspaceId: z.string().min(1),
  network: z.string().min(1),
  accountName: z.string().min(1).max(120),
});

const DeleteSchema = z.object({
  workspaceId: z.string().min(1),
  socialAccountId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = CreateSchema.parse(await request.json());
    const db = getAdminDb();
    await assertWorkspaceOwner(db, body.workspaceId, userId);

    const capability = getNetworkCapability(body.network);
    const networkLabel = capability?.label ?? body.network.trim();

    const docRef = await db.collection(`workspaces/${body.workspaceId}/social_accounts`).add({
      workspaceId: body.workspaceId,
      network: networkLabel,
      accountName: body.accountName.trim(),
      status: 'connected',
      integrationMode: 'metadata_only',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = DeleteSchema.parse(await request.json());
    const db = getAdminDb();
    await assertWorkspaceOwner(db, body.workspaceId, userId);

    const docRef = db.collection(`workspaces/${body.workspaceId}/social_accounts`).doc(body.socialAccountId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Social account not found.' }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return toApiError(error);
  }
}
