import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';

const GRAPH = 'https://graph.facebook.com/v22.0';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');
  const state = searchParams.get('state');

  // Retrieve workspaceId from state if encoded
  let workspaceId: string | null = null;
  try {
    if (state) {
      const parsedState = JSON.parse(state);
      workspaceId = parsedState.workspaceId;
    }
  } catch {
    // Fallback if state is not JSON
  }

  if (error) {
    return NextResponse.redirect(
      new URL(`/app/connect?error=${encodeURIComponent(errorDesc ?? error)}`, req.url)
    );
  }

  // 1. Short-lived token
  const shortRes = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/meta`,
    code: code!,
  }));
  const { access_token: shortToken, error: tokenError } = await shortRes.json();
  if (tokenError) throw new Error(`Meta token exchange failed: ${tokenError.message}`);

  // 2. Long-lived user token (60 days)
  const longRes = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortToken,
  }));
  const { access_token: longToken, expires_in } = await longRes.json();

  // 3. Get Meta user identity
  const meRes = await fetch(`${GRAPH}/me?access_token=${longToken}&fields=id,name`);
  const { id: metaUserId, name } = await meRes.json();

  // 4. Fetch all pages with their permanent page tokens + linked IG accounts
  const pagesRes = await fetch(
    `${GRAPH}/me/accounts?access_token=${longToken}` +
    `&fields=id,name,access_token,category,picture,instagram_business_account`
  );
  const { data: pages } = await pagesRes.json();

  // 5. Identify Firebase user
  const session = req.cookies.get('session')?.value;
  if (!session) return NextResponse.redirect(new URL('/auth?mode=login', req.url));
  const { uid } = await adminAuth.verifySessionCookie(session);

  // 6. Batch write to Firestore
  const batch = adminDb.batch();

  // Centralized token storage
  batch.set(adminDb.doc(`users/${uid}/metaTokens/facebook`), {
    userId: metaUserId,
    name,
    accessToken: encryptToken(longToken),
    expiresAt: Date.now() + expires_in * 1000,
    connectedAt: Date.now(),
    platform: 'facebook',
  });

  for (const page of pages) {
    // User-centric backup
    batch.set(adminDb.doc(`users/${uid}/connectedPages/${page.id}`), {
      pageId: page.id,
      name: page.name,
      category: page.category,
      picture: page.picture?.data?.url ?? null,
      accessToken: encryptToken(page.access_token),
      platform: 'facebook',
      instagramAccountId: page.instagram_business_account?.id ?? null,
      connectedAt: Date.now(),
    });

    // Workspace-centric storage (if workspaceId is provided)
    if (workspaceId) {
      const socialAccountRef = adminDb.doc(`workspaces/${workspaceId}/social_accounts/fb_${page.id}`);
      batch.set(socialAccountRef, {
        workspaceId,
        network: 'facebook',
        accountName: page.name,
        accountExternalId: page.id,
        status: 'connected',
        integrationMode: 'oauth',
        credentialRef: `users/${uid}/metaTokens/facebook`,
        accessToken: encryptToken(page.access_token), // Store page token here for easy backend access
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      if (page.instagram_business_account) {
        const igAccountRef = adminDb.doc(`workspaces/${workspaceId}/social_accounts/ig_${page.instagram_business_account.id}`);
        batch.set(igAccountRef, {
          workspaceId,
          network: 'instagram',
          accountName: `${page.name} (Instagram)`,
          accountExternalId: page.instagram_business_account.id,
          facebookPageId: page.id,
          status: 'connected',
          integrationMode: 'oauth',
          credentialRef: `users/${uid}/metaTokens/facebook`,
          accessToken: encryptToken(page.access_token), // IG uses Page Token or User Token with permissions
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }
  }

  await batch.commit();

  // 7. Subscribe each page to webhooks (async, non-blocking)
  Promise.all(pages.map((p: any) => subscribePageWebhooks(p.id, p.access_token)));

  return NextResponse.redirect(
    new URL(`/app/connect?success=meta&workspaceId=${workspaceId || ''}`, req.url)
  );
}

async function subscribePageWebhooks(pageId: string, pageToken: string) {
  await fetch(`${GRAPH}/${pageId}/subscribed_apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscribed_fields: ['feed', 'messages', 'mention', 'ratings'],
      access_token: pageToken,
    }),
  });
}
