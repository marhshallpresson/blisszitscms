import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { normalizeNetworkKey } from '@/lib/network-capabilities';
import { writeAuditLog } from '@/lib/server/audit-log';
import { getConnectorAdapter } from '@/lib/connectors/registry';
import { getCredential, saveCredential } from '@/lib/server/token-store';

const RefreshSchema = z.object({
  workspaceId: z.string().min(1),
  socialAccountId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ network: string }> }
) {
  try {
    const userId = await requireUserId(request);
    const { network } = await context.params;
    const normalized = normalizeNetworkKey(network);
    if (!normalized) {
      return NextResponse.json({ error: 'Unsupported network.' }, { status: 400 });
    }

    const body = RefreshSchema.parse(await request.json());
    const db = getAdminDb();
    await assertWorkspaceOwner(db, body.workspaceId, userId);
    const adapter = getConnectorAdapter(normalized);
    if (!adapter) {
      return NextResponse.json({ error: `No connector adapter for ${normalized}.` }, { status: 501 });
    }

    const accountRef = db.collection(`workspaces/${body.workspaceId}/social_accounts`).doc(body.socialAccountId);
    const accountSnap = await accountRef.get();
    if (!accountSnap.exists) {
      return NextResponse.json({ error: 'Social account not found.' }, { status: 404 });
    }
    const account = accountSnap.data() as {
      credentialRef?: string;
      accountExternalId?: string;
      accountName?: string;
    };
    if (!account.credentialRef) {
      return NextResponse.json({ error: 'Social account does not have OAuth credentials.' }, { status: 400 });
    }

    const currentToken = await getCredential(db, account.credentialRef);
    const refreshed = await adapter.refreshToken({
      refreshToken: currentToken.refreshToken,
      accessToken: currentToken.accessToken,
    });

    const credentialRef = await saveCredential(
      db,
      {
        workspaceId: body.workspaceId,
        network: normalized,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || currentToken.refreshToken,
        tokenType: refreshed.tokenType || currentToken.tokenType,
        expiresAt: refreshed.expiresAt || currentToken.expiresAt,
        scope: refreshed.scope || currentToken.scope,
        accountId: refreshed.accountId || currentToken.accountId || account.accountExternalId,
        accountName: refreshed.accountName || currentToken.accountName || account.accountName,
      },
      account.credentialRef
    );

    await accountRef.set(
      {
        status: 'connected',
        credentialRef,
        expiresAt: refreshed.expiresAt || currentToken.expiresAt || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await writeAuditLog(db, {
      workspaceId: body.workspaceId,
      actorId: userId,
      action: 'oauth.refresh',
      entityType: 'social_account',
      entityId: body.socialAccountId,
      outcome: 'success',
      details: {
        network: normalized,
      },
    });

    return NextResponse.json(
      {
        status: 'refreshed',
        network: normalized,
        expiresAt: refreshed.expiresAt || currentToken.expiresAt || null,
      },
      { status: 200 }
    );
  } catch (error) {
    return toApiError(error);
  }
}
