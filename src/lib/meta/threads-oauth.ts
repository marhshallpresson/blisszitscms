const THREADS_AUTH_URL  = 'https://threads.net/oauth/authorize';
const THREADS_TOKEN_URL = 'https://graph.threads.net/oauth/access_token';
const THREADS_LONG_URL  = 'https://graph.threads.net/access_token';

export function buildThreadsAuthUrl(state: string): string {
  return `${THREADS_AUTH_URL}?` + new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/threads`,
    scope: [
      'threads_basic',
      'threads_content_publish',
      'threads_manage_replies',
      'threads_read_replies',
      'threads_manage_insights',
    ].join(','),
    response_type: 'code',
    state,
  });
}

export async function exchangeThreadsCode(code: string): Promise<{
  accessToken: string;
  expiresAt: number;
  userId: string;
}> {
  // Step 1: Short-lived (1 hour)
  const shortRes = await fetch(THREADS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/threads`,
      code,
    }),
  });
  const { access_token: shortToken, user_id } = await shortRes.json();

  // Step 2: Long-lived (60 days)
  const longRes = await fetch(`${THREADS_LONG_URL}?` + new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: process.env.META_APP_SECRET!,
    access_token: shortToken,
  }));
  const { access_token, expires_in } = await longRes.json();

  return {
    accessToken: access_token,
    expiresAt: Date.now() + expires_in * 1000,
    userId: String(user_id),
  };
}
