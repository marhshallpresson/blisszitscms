import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/api-auth';
import { toApiError } from '@/lib/server/api-response';

const NETWORKS = ['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'x'] as const;

type OAuthConfigStatus = {
  network: string;
  configured: boolean;
};

const hasOAuthConfig = (network: string): boolean => {
  const prefix = `OAUTH_${network.toUpperCase()}`;
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const authUrl = process.env[`${prefix}_AUTH_URL`];
  return Boolean(clientId && authUrl);
};

export async function GET(request: NextRequest) {
  try {
    await requireUserId(request);

    const oauthConfig: OAuthConfigStatus[] = NETWORKS.map((network) => ({
      network,
      configured: hasOAuthConfig(network),
    }));

    const primaryConfigured = oauthConfig
      .filter((entry) => entry.network === 'facebook' || entry.network === 'instagram' || entry.network === 'linkedin')
      .every((entry) => entry.configured);
    const hasTokenEncryptionKey = Boolean(process.env.TOKEN_ENCRYPTION_KEY);

    const healthUrl = process.env.DEPLOY_HEALTH_URL || process.env.NEXT_PUBLIC_DEPLOY_HEALTH_URL || '';
    let productionHealth: 'healthy' | 'unreachable' | 'not_configured' = 'not_configured';
    let productionStatusCode: number | null = null;
    let productionError: string | null = null;

    if (healthUrl) {
      try {
        const response = await fetch(healthUrl, { method: 'GET', cache: 'no-store' });
        productionStatusCode = response.status;
        productionHealth = response.ok ? 'healthy' : 'unreachable';
      } catch (error) {
        productionHealth = 'unreachable';
        productionError = error instanceof Error ? error.message : 'Unknown health check error';
      }
    }

    const phase =
      primaryConfigured && productionHealth === 'healthy' && hasTokenEncryptionKey
        ? 'phase_2_connector_rollout'
        : 'phase_1_hardened';

    const blockers = [];
    if (!primaryConfigured) blockers.push('OAuth config incomplete for Meta/LinkedIn.');
    if (!hasTokenEncryptionKey) blockers.push('TOKEN_ENCRYPTION_KEY is not configured.');
    if (productionHealth !== 'healthy') blockers.push('Production health check not passing or not configured.');
    blockers.push('Provider scopes/account IDs must be finalized for production publishing.');

    return NextResponse.json(
      {
        phase,
        checkedAt: new Date().toISOString(),
        production: {
          healthUrlConfigured: Boolean(healthUrl),
          health: productionHealth,
          statusCode: productionStatusCode,
          error: productionError,
        },
        oauthConfig,
        blockers,
      },
      { status: 200 }
    );
  } catch (error) {
    return toApiError(error);
  }
}
