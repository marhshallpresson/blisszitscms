export const FB_OAUTH_BASE = 'https://www.facebook.com/v22.0/dialog/oauth';
export const GRAPH = 'https://graph.facebook.com/v22.0';

/**
 * Builds the Facebook Login for Business OAuth URL.
 * Uses config_id (bundled permissions) instead of individual scope strings.
 * This presents a single Business Portfolio selector instead of per-page checkboxes.
 */
export function buildMetaAuthUrl(state: string, includeInstagram = true): string {
  const scopes = [
    'business_management',
    'pages_show_list',
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_manage_engagement',
    'pages_messaging',
    'publish_video',
  ];

  if (includeInstagram) {
    scopes.push(
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_messages',
      'instagram_manage_insights',
    );
  }

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/meta`,
    response_type: 'code',
    scope: scopes.join(','),
    // config_id enables the Business Portfolio selector modal
    config_id: process.env.NEXT_PUBLIC_META_LOGIN_CONFIG_ID!,
    state,
  });

  return `${FB_OAUTH_BASE}?${params}`;
}
