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

const linkedInConfig = () => {
  const clientId = process.env.OAUTH_LINKEDIN_CLIENT_ID || '';
  const clientSecret = process.env.OAUTH_LINKEDIN_CLIENT_SECRET || '';
  const authUrl = process.env.OAUTH_LINKEDIN_AUTH_URL || 'https://www.linkedin.com/oauth/v2/authorization';
  const tokenUrl = process.env.OAUTH_LINKEDIN_TOKEN_URL || 'https://www.linkedin.com/oauth/v2/accessToken';
  const apiBase = process.env.OAUTH_LINKEDIN_API_BASE || 'https://api.linkedin.com';
  return { clientId, clientSecret, authUrl, tokenUrl, apiBase };
};

const parseScope = (scope?: string): string[] => (scope || '').split(' ').map((s) => s.trim()).filter(Boolean);

const toForm = (payload: Record<string, string>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => params.set(key, value));
  return params;
};

export const linkedInAdapter: ConnectorAdapter = {
  network: 'linkedin',
  getCapabilities() {
    return getNetworkCapability('linkedin')!;
  },
  async exchangeAuthCode(input: OAuthExchangeInput): Promise<OAuthTokenEnvelope> {
    const cfg = linkedInConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('LinkedIn OAuth is not configured.');
    }

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toForm({
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: input.redirectUri,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload?.access_token) {
      throw new Error(
        `LinkedIn token exchange failed: ${typeof payload?.error_description === 'string' ? payload.error_description : 'unknown'}`
      );
    }

    const accessToken = String(payload.access_token);
    const refreshToken = payload.refresh_token ? String(payload.refresh_token) : undefined;
    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
    const scope = parseScope(typeof payload.scope === 'string' ? payload.scope : undefined);

    let accountId: string | undefined;
    let accountName: string | undefined;
    try {
      const profileResp = await fetch(`${cfg.apiBase}/v2/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = (await profileResp.json().catch(() => null)) as Record<string, unknown> | null;
      if (profileResp.ok && profile) {
        accountId = typeof profile.sub === 'string' ? profile.sub : undefined;
        accountName =
          (typeof profile.name === 'string' && profile.name) ||
          (typeof profile.localizedFirstName === 'string'
            ? `${String(profile.localizedFirstName)} ${String(profile.localizedLastName || '')}`.trim()
            : undefined);
      }
    } catch {
      // Best effort profile fetch.
    }

    return {
      accessToken,
      refreshToken,
      tokenType: typeof payload.token_type === 'string' ? payload.token_type : 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope,
      accountId,
      accountName,
      raw: payload,
    };
  },
  async refreshToken(input: RefreshInput): Promise<OAuthTokenEnvelope> {
    const cfg = linkedInConfig();
    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('LinkedIn OAuth is not configured.');
    }
    if (!input.refreshToken) {
      throw new Error('LinkedIn refresh token is missing.');
    }

    const response = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toForm({
        grant_type: 'refresh_token',
        refresh_token: input.refreshToken,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload?.access_token) {
      throw new Error(
        `LinkedIn refresh failed: ${typeof payload?.error_description === 'string' ? payload.error_description : 'unknown'}`
      );
    }

    const accessToken = String(payload.access_token);
    const refreshToken = payload.refresh_token ? String(payload.refresh_token) : input.refreshToken;
    const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
    const scope = parseScope(typeof payload.scope === 'string' ? payload.scope : undefined);

    return {
      accessToken,
      refreshToken,
      tokenType: typeof payload.token_type === 'string' ? payload.token_type : 'Bearer',
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scope,
      raw: payload,
    };
  },
  async publishPost(input: PublishInput): Promise<PublishResult> {
    if (!input.accessToken) throw new Error('LinkedIn access token missing.');
    if (!input.accountId) {
      throw new Error('LinkedIn account ID missing. Reconnect account with OpenID profile scope.');
    }

    const cfg = linkedInConfig();
    const authorUrn = input.accountId.startsWith('urn:') ? input.accountId : `urn:li:person:${input.accountId}`;
    const response = await fetch(`${cfg.apiBase}/v2/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: input.text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const payload = await response.text().catch(() => '');
      throw new Error(`LinkedIn publish failed: ${payload || response.status}`);
    }

    const entityUrn = response.headers.get('x-restli-id') || `linkedin_${Date.now()}`;
    return {
      externalPostId: entityUrn,
      publishedAt: new Date().toISOString(),
      providerRequestId: entityUrn,
    };
  },
  async fetchInbox(_input: InboxFetchInput): Promise<InboxFetchResult> {
    return { threadCount: 0, messageCount: 0 };
  },
  async replyToThread(_input: ReplyInput): Promise<ReplyResult> {
    throw new Error('LinkedIn reply API is not enabled in current scope.');
  },
  async fetchAnalytics(_input: AnalyticsFetchInput): Promise<AnalyticsFetchResult> {
    return { postCount: 0, engagementCount: 0 };
  },
};
