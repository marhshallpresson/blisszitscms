import type {
  AnalyticsFetchInput,
  AnalyticsFetchResult,
  ConnectorAdapter,
  InboxFetchInput,
  InboxFetchResult,
  OAuthExchangeInput,
  OAuthTokenEnvelope,
  PublishInput,
  PublishResult,
  RefreshInput,
  ReplyInput,
  ReplyResult,
} from '@/lib/connectors/types';
import { getNetworkCapability } from '@/lib/network-capabilities';

const tiktokConfig = () => {
  const clientId = process.env.OAUTH_TIKTOK_CLIENT_ID || process.env.OAUTH_TIKTOK_CLIENT_KEY || '';
  const clientSecret = process.env.OAUTH_TIKTOK_CLIENT_SECRET || '';
  const tokenUrl = process.env.OAUTH_TIKTOK_TOKEN_URL || 'https://open.tiktokapis.com/v2/oauth/token/';
  const apiBase = process.env.OAUTH_TIKTOK_API_BASE || 'https://open.tiktokapis.com';
  return { clientId, clientSecret, tokenUrl, apiBase };
};

const toForm = (payload: Record<string, string>) => {
  const form = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) form.set(key, value);
  });
  return form;
};

const parseScope = (scope?: string): string[] =>
  (scope || '')
    .split(/[ ,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const pickTokenData = (payload: Record<string, unknown> | null): Record<string, unknown> => {
  if (!payload) return {};
  if (payload.data && typeof payload.data === 'object') {
    return payload.data as Record<string, unknown>;
  }
  return payload;
};

export const tiktokAdapter: ConnectorAdapter = {
  network: 'tiktok',
  getCapabilities() {
    return getNetworkCapability('tiktok')!;
  },
  async exchangeAuthCode(input: OAuthExchangeInput): Promise<OAuthTokenEnvelope> {
    const cfg = tiktokConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('TikTok OAuth client credentials are not configured.');
    }

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toForm({
        client_key: cfg.clientId,
        client_secret: cfg.clientSecret,
        code: input.code,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri,
        code_verifier: input.codeVerifier || '',
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const tokenData = pickTokenData(payload);
    const accessToken = typeof tokenData.access_token === 'string' ? tokenData.access_token : '';
    if (!response.ok || !accessToken) {
      throw new Error(`TikTok token exchange failed: ${typeof payload?.message === 'string' ? payload.message : 'unknown'}`);
    }

    const refreshToken = typeof tokenData.refresh_token === 'string' ? tokenData.refresh_token : undefined;
    const expiresIn = typeof tokenData.expires_in === 'number' ? tokenData.expires_in : undefined;
    const scope = parseScope(typeof tokenData.scope === 'string' ? tokenData.scope : undefined);
    const accountId = typeof tokenData.open_id === 'string' ? tokenData.open_id : undefined;

    let accountName: string | undefined;
    try {
      const profileResp = await fetch(
        `${cfg.apiBase}/v2/user/info/?fields=open_id,display_name,avatar_url`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const profilePayload = (await profileResp.json().catch(() => null)) as
        | { data?: { user?: { display_name?: string } } }
        | null;
      if (profileResp.ok) {
        accountName = profilePayload?.data?.user?.display_name;
      }
    } catch {
      // Best effort.
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope,
      accountId,
      accountName,
      raw: payload || undefined,
    };
  },
  async refreshToken(input: RefreshInput): Promise<OAuthTokenEnvelope> {
    const cfg = tiktokConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('TikTok OAuth client credentials are not configured.');
    }
    if (!input.refreshToken) {
      throw new Error('TikTok refresh token is missing.');
    }

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toForm({
        client_key: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: input.refreshToken,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const tokenData = pickTokenData(payload);
    const accessToken = typeof tokenData.access_token === 'string' ? tokenData.access_token : '';
    if (!response.ok || !accessToken) {
      throw new Error(`TikTok token refresh failed: ${typeof payload?.message === 'string' ? payload.message : 'unknown'}`);
    }

    const refreshToken = typeof tokenData.refresh_token === 'string' ? tokenData.refresh_token : input.refreshToken;
    const expiresIn = typeof tokenData.expires_in === 'number' ? tokenData.expires_in : undefined;
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope: parseScope(typeof tokenData.scope === 'string' ? tokenData.scope : undefined),
      raw: payload || undefined,
    };
  },
  async publishPost(_input: PublishInput): Promise<PublishResult> {
    throw new Error('TikTok publishing is not enabled in this build. Direct post API requires additional review.');
  },
  async fetchInbox(_input: InboxFetchInput): Promise<InboxFetchResult> {
    return { threadCount: 0, messageCount: 0 };
  },
  async replyToThread(_input: ReplyInput): Promise<ReplyResult> {
    throw new Error('TikTok reply workflow is not enabled yet.');
  },
  async fetchAnalytics(_input: AnalyticsFetchInput): Promise<AnalyticsFetchResult> {
    return { postCount: 0, engagementCount: 0 };
  },
};
