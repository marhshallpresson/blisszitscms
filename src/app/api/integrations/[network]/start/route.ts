import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { assertWorkspaceOwner } from '@/lib/server/workspace-access';
import { normalizeNetworkKey, type NetworkKey } from '@/lib/network-capabilities';

const StartSchema = z.object({
  workspaceId: z.string().min(1),
  redirectUri: z.string().url(),
  codeVerifier: z.string().min(43).max(128),
  codeChallenge: z.string().min(32).max(256),
  codeChallengeMethod: z.literal('S256').default('S256'),
});

const DEFAULT_OAUTH: Record<NetworkKey, { authUrl: string; scope: string }> = {
  facebook: {
    authUrl: 'https://www.facebook.com/v22.0/dialog/oauth',
    scope: 'pages_show_list,pages_manage_posts,pages_read_engagement,business_management',
  },
  instagram: {
    authUrl: 'https://www.facebook.com/v22.0/dialog/oauth',
    scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_manage_posts',
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scope: 'openid profile email w_member_social',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    scope: 'user.info.basic,video.list',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid profile email https://www.googleapis.com/auth/youtube.readonly',
  },
  x: {
    authUrl: 'https://x.com/i/oauth2/authorize',
    scope: 'tweet.read users.read offline.access tweet.write',
  },
};

const getOAuthEnv = (network: NetworkKey) => {
  const prefix = `OAUTH_${network.toUpperCase()}`;
  const defaults = DEFAULT_OAUTH[network];
  return {
    clientId: process.env[`${prefix}_CLIENT_ID`] || '',
    authUrl: process.env[`${prefix}_AUTH_URL`] || defaults.authUrl,
    scope: process.env[`${prefix}_SCOPE`] || defaults.scope,
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
      codeVerifier: body.codeVerifier,
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
    authUrl.searchParams.set(normalized === 'tiktok' ? 'client_key' : 'client_id', oauth.clientId);
    authUrl.searchParams.set('redirect_uri', body.redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', body.codeChallenge);
    authUrl.searchParams.set('code_challenge_method', body.codeChallengeMethod);
    if (oauth.scope) {
      authUrl.searchParams.set('scope', oauth.scope);
    }
    if (normalized === 'youtube') {
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('include_granted_scopes', 'true');
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
