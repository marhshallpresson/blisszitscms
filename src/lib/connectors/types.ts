import type { NetworkCapability, NetworkKey } from '@/lib/network-capabilities';

export interface OAuthExchangeInput {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}

export interface RefreshInput {
  refreshToken?: string;
  accessToken?: string;
}

export interface OAuthTokenEnvelope {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: string;
  scope?: string[];
  accountId?: string;
  accountName?: string;
  raw?: Record<string, unknown>;
}

export interface PublishInput {
  workspaceId: string;
  contentItemId: string;
  network: NetworkKey;
  text: string;
  mediaUrl?: string;
  accessToken?: string;
  accountId?: string;
}

export interface PublishResult {
  externalPostId: string;
  publishedAt: string;
  providerRequestId?: string;
}

export interface InboxFetchInput {
  workspaceId: string;
  network: NetworkKey;
  since?: string;
}

export interface InboxFetchResult {
  threadCount: number;
  messageCount: number;
}

export interface ReplyInput {
  workspaceId: string;
  network: NetworkKey;
  threadId: string;
  message: string;
}

export interface ReplyResult {
  providerMessageId: string;
  sentAt: string;
}

export interface AnalyticsFetchInput {
  workspaceId: string;
  network: NetworkKey;
  from: string;
  to: string;
}

export interface AnalyticsFetchResult {
  postCount: number;
  engagementCount: number;
}

export interface ConnectorAdapter {
  network: NetworkKey;
  getCapabilities(): NetworkCapability;
  exchangeAuthCode(input: OAuthExchangeInput): Promise<OAuthTokenEnvelope>;
  refreshToken(input: RefreshInput): Promise<OAuthTokenEnvelope>;
  publishPost(input: PublishInput): Promise<PublishResult>;
  fetchInbox(input: InboxFetchInput): Promise<InboxFetchResult>;
  replyToThread(input: ReplyInput): Promise<ReplyResult>;
  fetchAnalytics(input: AnalyticsFetchInput): Promise<AnalyticsFetchResult>;
}
