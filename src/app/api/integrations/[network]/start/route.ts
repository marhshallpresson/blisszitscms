import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { normalizeNetworkKey } from '@/lib/network-capabilities';

const StartSchema = z.object({
  workspaceId: z.string().min(1),
  redirectUri: z.string().url(),
  codeChallenge: z.string().min(32).max(256),
  codeChallengeMethod: z.literal('S256').default('S256'),
});

const getOAuthEnv = (network: string) => {
  const prefix = `OAUTH_${network.toUpperCase()}`;
  return {
    clientId: process.env[`${prefix}_CLIENT_ID`] || '',
    authUrl: process.env[`${prefix}_AUTH_URL`] || '',
    scope: process.env[`${prefix}_SCOPE`] || '',
  };
};

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

    const body = StartSchema.parse(await request.json());
    const db = getAdminDb();
    await assertWorkspaceOwner(db, body.workspaceId, userId);

    const state = randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await db.collection('oauth_states').doc(state).set({
      workspaceId: body.workspaceId,
      network: normalized,
      userId,
      redirectUri: body.redirectUri,
      codeChallenge: body.codeChallenge,
      codeChallengeMethod: body.codeChallengeMethod,
      used: false,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    const oauth = getOAuthEnv(normalized);
    if (!oauth.clientId || !oauth.authUrl) {
      return NextResponse.json(
        {
          state,
          status: 'not_configured',
          message: `OAuth for ${normalized} is not configured yet.`,
        },
        { status: 501 }
      );
    }

    const authUrl = new URL(oauth.authUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', oauth.clientId);
    authUrl.searchParams.set('redirect_uri', body.redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', body.codeChallenge);
    authUrl.searchParams.set('code_challenge_method', body.codeChallengeMethod);
    if (oauth.scope) {
      authUrl.searchParams.set('scope', oauth.scope);
    }

    return NextResponse.json({
      network: normalized,
      state,
      authorizationUrl: authUrl.toString(),
      expiresAt,
    });
  } catch (error) {
    return toApiError(error);
  }
}
