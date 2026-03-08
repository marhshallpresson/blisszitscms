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

const xConfig = () => {
  const clientId = process.env.OAUTH_X_CLIENT_ID || '';
  const clientSecret = process.env.OAUTH_X_CLIENT_SECRET || '';
  const tokenUrl = process.env.OAUTH_X_TOKEN_URL || 'https://api.x.com/2/oauth2/token';
  const apiBase = process.env.OAUTH_X_API_BASE || 'https://api.x.com/2';
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

const getTokenHeaders = (clientId: string, clientSecret?: string): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers.Authorization = `Basic ${credentials}`;
  }
  return headers;
};

export const xAdapter: ConnectorAdapter = {
  network: 'x',
  getCapabilities() {
    return getNetworkCapability('x')!;
  },
  async exchangeAuthCode(input: OAuthExchangeInput): Promise<OAuthTokenEnvelope> {
    const cfg = xConfig();
    if (!cfg.clientId) throw new Error('X OAuth client ID is not configured.');
    if (!input.codeVerifier) throw new Error('X OAuth requires PKCE code verifier.');

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: getTokenHeaders(cfg.clientId, cfg.clientSecret),
      body: toForm({
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: input.redirectUri,
        code_verifier: input.codeVerifier,
        client_id: cfg.clientSecret ? '' : cfg.clientId,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload?.access_token) {
      throw new Error(`X token exchange failed: ${typeof payload?.error === 'string' ? payload.error : 'unknown'}`);
    }

    const accessToken = String(payload.access_token);
    const refreshToken = typeof payload.refresh_token === 'string' ? payload.refresh_token : undefined;
    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
    const scope = parseScope(typeof payload.scope === 'string' ? payload.scope : undefined);

    let accountId: string | undefined;
    let accountName: string | undefined;
    try {
      const profileResp = await fetch(`${cfg.apiBase}/users/me?user.fields=id,name,username`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profilePayload = (await profileResp.json().catch(() => null)) as
        | { data?: { id?: string; name?: string; username?: string } }
        | null;
      if (profileResp.ok && profilePayload?.data) {
        accountId = profilePayload.data.id;
        accountName = profilePayload.data.name || profilePayload.data.username;
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
    const cfg = xConfig();
    if (!cfg.clientId) throw new Error('X OAuth client ID is not configured.');
    if (!input.refreshToken) throw new Error('X refresh token is missing.');

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: getTokenHeaders(cfg.clientId, cfg.clientSecret),
      body: toForm({
        grant_type: 'refresh_token',
        refresh_token: input.refreshToken,
        client_id: cfg.clientSecret ? '' : cfg.clientId,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload?.access_token) {
      throw new Error(`X token refresh failed: ${typeof payload?.error === 'string' ? payload.error : 'unknown'}`);
    }

    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
    return {
      accessToken: String(payload.access_token),
      refreshToken: typeof payload.refresh_token === 'string' ? payload.refresh_token : input.refreshToken,
      tokenType: typeof payload.token_type === 'string' ? payload.token_type : 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope: parseScope(typeof payload.scope === 'string' ? payload.scope : undefined),
      raw: payload || undefined,
    };
  },
  async publishPost(input: PublishInput): Promise<PublishResult> {
    if (!input.accessToken) throw new Error('X access token missing.');
    const response = await fetch(`${xConfig().apiBase}/tweets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input.text }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { data?: { id?: string }; errors?: Array<{ detail?: string }> }
      | null;
    if (!response.ok || !payload?.data?.id) {
      const reason = payload?.errors?.[0]?.detail || response.statusText || 'unknown';
      throw new Error(`X publish failed: ${reason}`);
    }

    return {
      externalPostId: String(payload.data.id),
      publishedAt: new Date().toISOString(),
      providerRequestId: String(payload.data.id),
    };
  },
  async fetchInbox(_input: InboxFetchInput): Promise<InboxFetchResult> {
    return { threadCount: 0, messageCount: 0 };
  },
  async replyToThread(_input: ReplyInput): Promise<ReplyResult> {
    throw new Error('X reply workflow is not enabled yet.');
  },
  async fetchAnalytics(_input: AnalyticsFetchInput): Promise<AnalyticsFetchResult> {
    return { postCount: 0, engagementCount: 0 };
  },
};
