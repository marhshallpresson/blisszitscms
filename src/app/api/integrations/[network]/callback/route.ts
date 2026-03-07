import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { normalizeNetworkKey } from '@/lib/network-capabilities';
import { writeAuditLog } from '@/lib/server/audit-log';
import { getConnectorAdapter } from '@/lib/connectors/registry';
import { saveCredential } from '@/lib/server/token-store';

const redirectWithStatus = (request: NextRequest, network: string, status: string, reason?: string) => {
  const target = new URL('/app/settings', request.nextUrl.origin);
  target.searchParams.set('oauth_network', network);
  target.searchParams.set('oauth_status', status);
  if (reason) target.searchParams.set('oauth_reason', reason);
  return NextResponse.redirect(target);
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ network: string }> }
) {
  const { network } = await context.params;
  const normalized = normalizeNetworkKey(network);
  if (!normalized) {
    return redirectWithStatus(request, network, 'error', 'unsupported_network');
  }

  const state = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');
  const providerError = request.nextUrl.searchParams.get('error');
  if (!state) {
    return redirectWithStatus(request, normalized, 'error', 'missing_state');
  }
  if (providerError) {
    return redirectWithStatus(request, normalized, 'error', providerError);
  }
  if (!code) {
    return redirectWithStatus(request, normalized, 'error', 'missing_code');
  }

  const db = getAdminDb();
  const stateRef = db.collection('oauth_states').doc(state);
  const stateSnap = await stateRef.get();
  if (!stateSnap.exists) {
    return redirectWithStatus(request, normalized, 'error', 'invalid_state');
  }

  const stateData = stateSnap.data() as {
    workspaceId?: string;
    userId?: string;
    network?: string;
    used?: boolean;
    expiresAt?: string;
    redirectUri?: string;
  };

  const expired = !stateData.expiresAt || new Date(stateData.expiresAt).getTime() < Date.now();
  if (stateData.used || expired || stateData.network !== normalized || !stateData.workspaceId || !stateData.userId) {
    return redirectWithStatus(request, normalized, 'error', 'expired_or_mismatch_state');
  }

  await stateRef.set(
    {
      used: true,
      usedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  const adapter = getConnectorAdapter(normalized);
  if (!adapter) {
    await writeAuditLog(db, {
      workspaceId: stateData.workspaceId,
      actorId: stateData.userId,
      action: 'oauth.callback',
      entityType: 'social_account',
      outcome: 'failure',
      details: {
        network: normalized,
        reason: 'adapter_not_implemented',
      },
    });
    return redirectWithStatus(request, normalized, 'error', 'adapter_not_implemented');
  }

  try {
    const token = await adapter.exchangeAuthCode({
      code,
      redirectUri: stateData.redirectUri || '',
    });

    const credentialRef = await saveCredential(db, {
      workspaceId: stateData.workspaceId,
      network: normalized,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      scope: token.scope,
      accountId: token.accountId,
      accountName: token.accountName,
    });

    const existingAccount = await db
      .collection(`workspaces/${stateData.workspaceId}/social_accounts`)
      .where('network', '==', normalized)
      .limit(1)
      .get();

    const targetRef = existingAccount.empty
      ? db.collection(`workspaces/${stateData.workspaceId}/social_accounts`).doc()
      : existingAccount.docs[0].ref;

    await targetRef.set(
      {
        workspaceId: stateData.workspaceId,
        network: normalized,
        accountName: token.accountName || `${normalized} account`,
        accountExternalId: token.accountId || '',
        status: 'connected',
        integrationMode: 'oauth',
        credentialRef,
        scope: token.scope || [],
        expiresAt: token.expiresAt || null,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await writeAuditLog(db, {
      workspaceId: stateData.workspaceId,
      actorId: stateData.userId,
      action: 'oauth.callback',
      entityType: 'social_account',
      entityId: targetRef.id,
      outcome: 'success',
      details: {
        network: normalized,
      },
    });

    return redirectWithStatus(request, normalized, 'connected');
  } catch (error) {
    await db.collection(`workspaces/${stateData.workspaceId}/social_accounts`).add({
      workspaceId: stateData.workspaceId,
      network: normalized,
      accountName: `${normalized} OAuth`,
      status: 'error',
      integrationMode: 'oauth',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await writeAuditLog(db, {
      workspaceId: stateData.workspaceId,
      actorId: stateData.userId,
      action: 'oauth.callback',
      entityType: 'social_account',
      outcome: 'failure',
      details: {
        network: normalized,
        reason: error instanceof Error ? error.message : 'token_exchange_failed',
      },
    });

    return redirectWithStatus(request, normalized, 'error', 'token_exchange_failed');
  }
}
