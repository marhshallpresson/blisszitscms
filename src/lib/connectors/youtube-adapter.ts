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

const youtubeConfig = () => {
  const clientId = process.env.OAUTH_YOUTUBE_CLIENT_ID || '';
  const clientSecret = process.env.OAUTH_YOUTUBE_CLIENT_SECRET || '';
  const tokenUrl = process.env.OAUTH_YOUTUBE_TOKEN_URL || 'https://oauth2.googleapis.com/token';
  const apiBase = process.env.OAUTH_YOUTUBE_API_BASE || 'https://www.googleapis.com';
  return { clientId, clientSecret, tokenUrl, apiBase };
};

const parseScope = (scope?: string): string[] => (scope || '').split(' ').map((s) => s.trim()).filter(Boolean);

const toForm = (payload: Record<string, string>) => {
  const form = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) form.set(key, value);
  });
  return form;
};

export const youtubeAdapter: ConnectorAdapter = {
  network: 'youtube',
  getCapabilities() {
    return getNetworkCapability('youtube')!;
  },
  async exchangeAuthCode(input: OAuthExchangeInput): Promise<OAuthTokenEnvelope> {
    const cfg = youtubeConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('YouTube OAuth client credentials are not configured.');
    }

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toForm({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code: input.code,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload?.access_token) {
      throw new Error(
        `YouTube token exchange failed: ${typeof payload?.error_description === 'string' ? payload.error_description : 'unknown'}`
      );
    }

    const accessToken = String(payload.access_token);
    const refreshToken = typeof payload.refresh_token === 'string' ? payload.refresh_token : undefined;
    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
    const scope = parseScope(typeof payload.scope === 'string' ? payload.scope : undefined);

    let accountId: string | undefined;
    let accountName: string | undefined;
    try {
      const channelsResp = await fetch(`${cfg.apiBase}/youtube/v3/channels?part=id,snippet&mine=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const channels = (await channelsResp.json().catch(() => null)) as
        | {
            items?: Array<{ id?: string; snippet?: { title?: string } }>;
          }
        | null;
      const first = channels?.items?.[0];
      if (channelsResp.ok && first) {
        accountId = first.id;
        accountName = first.snippet?.title;
      }
    } catch {
      // Best effort.
    }

    return {
      accessToken,
      refreshToken,
      tokenType: typeof payload.token_type === 'string' ? payload.token_type : 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope,
      accountId,
      accountName,
      raw: payload || undefined,
    };
  },
  async refreshToken(input: RefreshInput): Promise<OAuthTokenEnvelope> {
    const cfg = youtubeConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('YouTube OAuth client credentials are not configured.');
    }
    if (!input.refreshToken) {
      throw new Error('YouTube refresh token is missing.');
    }

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toForm({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: input.refreshToken,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload?.access_token) {
      throw new Error(
        `YouTube token refresh failed: ${typeof payload?.error_description === 'string' ? payload.error_description : 'unknown'}`
      );
    }

    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
    return {
      accessToken: String(payload.access_token),
      refreshToken: input.refreshToken,
      tokenType: typeof payload.token_type === 'string' ? payload.token_type : 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope: parseScope(typeof payload.scope === 'string' ? payload.scope : undefined),
      raw: payload || undefined,
    };
  },
  async publishPost(_input: PublishInput): Promise<PublishResult> {
    throw new Error('YouTube publishing is not enabled in this build. Video upload pipeline is required.');
  },
  async fetchInbox(_input: InboxFetchInput): Promise<InboxFetchResult> {
    return { threadCount: 0, messageCount: 0 };
  },
  async replyToThread(_input: ReplyInput): Promise<ReplyResult> {
    throw new Error('YouTube reply workflow is not enabled yet.');
  },
  async fetchAnalytics(_input: AnalyticsFetchInput): Promise<AnalyticsFetchResult> {
    return { postCount: 0, engagementCount: 0 };
  },
};
