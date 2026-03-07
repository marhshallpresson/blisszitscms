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

const metaConfig = () => {
  const clientId = process.env.OAUTH_FACEBOOK_CLIENT_ID || process.env.OAUTH_INSTAGRAM_CLIENT_ID || '';
  const clientSecret = process.env.OAUTH_FACEBOOK_CLIENT_SECRET || process.env.OAUTH_INSTAGRAM_CLIENT_SECRET || '';
  const tokenUrl = process.env.OAUTH_FACEBOOK_TOKEN_URL || 'https://graph.facebook.com/v22.0/oauth/access_token';
  const graphBase = process.env.OAUTH_FACEBOOK_API_BASE || 'https://graph.facebook.com/v22.0';
  return { clientId, clientSecret, tokenUrl, graphBase };
};

const exchangeAuthCode = async (input: OAuthExchangeInput): Promise<OAuthTokenEnvelope> => {
  const cfg = metaConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('Meta OAuth is not configured.');
  }

  const url = new URL(cfg.tokenUrl);
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('client_secret', cfg.clientSecret);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('code', input.code);

  const response = await fetch(url.toString(), { method: 'GET' });
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(
      `Meta token exchange failed: ${typeof payload?.error_description === 'string' ? payload.error_description : 'unknown'}`
    );
  }

  const shortToken = String(payload.access_token);
  const longLivedUrl = new URL(metaConfig().tokenUrl);
  longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longLivedUrl.searchParams.set('client_id', cfg.clientId);
  longLivedUrl.searchParams.set('client_secret', cfg.clientSecret);
  longLivedUrl.searchParams.set('fb_exchange_token', shortToken);

  const longResp = await fetch(longLivedUrl.toString(), { method: 'GET' });
  const longPayload = (await longResp.json().catch(() => null)) as Record<string, unknown> | null;
  const accessToken = longResp.ok && longPayload?.access_token ? String(longPayload.access_token) : shortToken;
  const expiresIn =
    (longResp.ok && typeof longPayload?.expires_in === 'number' ? longPayload.expires_in : undefined) ??
    (typeof payload.expires_in === 'number' ? payload.expires_in : undefined);

  let accountId: string | undefined;
  let accountName: string | undefined;
  try {
    const me = await fetch(`${cfg.graphBase}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
    });
    const mePayload = (await me.json().catch(() => null)) as Record<string, unknown> | null;
    if (me.ok && mePayload) {
      accountId = typeof mePayload.id === 'string' ? mePayload.id : undefined;
      accountName = typeof mePayload.name === 'string' ? mePayload.name : undefined;
    }
  } catch {
    // Best effort only.
  }

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
    accountId,
    accountName,
    raw: longResp.ok && longPayload ? longPayload : payload || undefined,
  };
};

const refreshMetaToken = async (input: RefreshInput): Promise<OAuthTokenEnvelope> => {
  const cfg = metaConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('Meta OAuth is not configured.');
  }
  if (!input.accessToken) {
    throw new Error('Meta access token missing for refresh.');
  }

  const url = new URL(cfg.tokenUrl);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('client_secret', cfg.clientSecret);
  url.searchParams.set('fb_exchange_token', input.accessToken);
  const response = await fetch(url.toString(), { method: 'GET' });
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(
      `Meta refresh failed: ${typeof payload?.error_description === 'string' ? payload.error_description : 'unknown'}`
    );
  }
  const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : undefined;
  return {
    accessToken: String(payload.access_token),
    tokenType: 'Bearer',
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
    raw: payload,
  };
};

const publishFacebook = async (input: PublishInput): Promise<PublishResult> => {
  if (!input.accessToken) throw new Error('Facebook access token missing.');
  if (!input.accountId) throw new Error('Facebook page ID missing.');

  const cfg = metaConfig();
  const response = await fetch(`${cfg.graphBase}/${input.accountId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      message: input.text,
      access_token: input.accessToken,
    }),
  });
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !payload?.id) {
    throw new Error(
      `Facebook publish failed: ${typeof payload?.error === 'object' ? JSON.stringify(payload.error) : 'unknown'}`
    );
  }
  return {
    externalPostId: String(payload.id),
    publishedAt: new Date().toISOString(),
    providerRequestId: String(payload.id),
  };
};

const publishInstagram = async (input: PublishInput): Promise<PublishResult> => {
  if (!input.accessToken) throw new Error('Instagram access token missing.');
  if (!input.accountId) throw new Error('Instagram business account ID missing.');
  if (!input.mediaUrl) {
    throw new Error('Instagram publishing requires mediaUrl.');
  }
  const cfg = metaConfig();
  const createResp = await fetch(`${cfg.graphBase}/${input.accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      image_url: input.mediaUrl,
      caption: input.text,
      access_token: input.accessToken,
    }),
  });
  const createPayload = (await createResp.json().catch(() => null)) as Record<string, unknown> | null;
  if (!createResp.ok || !createPayload?.id) {
    throw new Error(
      `Instagram media creation failed: ${typeof createPayload?.error === 'object' ? JSON.stringify(createPayload.error) : 'unknown'}`
    );
  }

  const publishResp = await fetch(`${cfg.graphBase}/${input.accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: String(createPayload.id),
      access_token: input.accessToken,
    }),
  });
  const publishPayload = (await publishResp.json().catch(() => null)) as Record<string, unknown> | null;
  if (!publishResp.ok || !publishPayload?.id) {
    throw new Error(
      `Instagram publish failed: ${typeof publishPayload?.error === 'object' ? JSON.stringify(publishPayload.error) : 'unknown'}`
    );
  }

  return {
    externalPostId: String(publishPayload.id),
    publishedAt: new Date().toISOString(),
    providerRequestId: String(publishPayload.id),
  };
};

export const facebookAdapter: ConnectorAdapter = {
  network: 'facebook',
  getCapabilities() {
    return getNetworkCapability('facebook')!;
  },
  exchangeAuthCode,
  refreshToken: refreshMetaToken,
  publishPost: publishFacebook,
  async fetchInbox(_input: InboxFetchInput): Promise<InboxFetchResult> {
    return { threadCount: 0, messageCount: 0 };
  },
  async replyToThread(_input: ReplyInput): Promise<ReplyResult> {
    throw new Error('Facebook reply workflow not enabled yet.');
  },
  async fetchAnalytics(_input: AnalyticsFetchInput): Promise<AnalyticsFetchResult> {
    return { postCount: 0, engagementCount: 0 };
  },
};

export const instagramAdapter: ConnectorAdapter = {
  network: 'instagram',
  getCapabilities() {
    return getNetworkCapability('instagram')!;
  },
  exchangeAuthCode,
  refreshToken: refreshMetaToken,
  publishPost: publishInstagram,
  async fetchInbox(_input: InboxFetchInput): Promise<InboxFetchResult> {
    return { threadCount: 0, messageCount: 0 };
  },
  async replyToThread(_input: ReplyInput): Promise<ReplyResult> {
    throw new Error('Instagram reply workflow not enabled yet.');
  },
  async fetchAnalytics(_input: AnalyticsFetchInput): Promise<AnalyticsFetchResult> {
    return { postCount: 0, engagementCount: 0 };
  },
};
