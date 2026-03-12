import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';
import { exchangeThreadsCode } from '@/lib/meta/threads-oauth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
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

  if (error) return NextResponse.redirect(new URL(`/app/connect?error=${error}`, req.url));

  const { accessToken, expiresAt, userId } = await exchangeThreadsCode(code!);

  // Fetch Threads profile
  const profileRes = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id,username,name&access_token=${accessToken}`
  );
  const profile = await profileRes.json();

  const session = req.cookies.get('session')?.value!;
  const { uid } = await adminAuth.verifySessionCookie(session);

  const batch = adminDb.batch();

  // Centralized user token
  batch.set(adminDb.doc(`users/${uid}/metaTokens/threads`), {
    userId,
    username: profile.username,
    name: profile.name,
    accessToken: encryptToken(accessToken),
    expiresAt,
    connectedAt: Date.now(),
    platform: 'threads',
  });

  // Workspace-centric storage
  if (workspaceId) {
    const socialAccountRef = adminDb.doc(`workspaces/${workspaceId}/social_accounts/th_${userId}`);
    batch.set(socialAccountRef, {
      workspaceId,
      network: 'threads',
      accountName: profile.name || profile.username,
      accountExternalId: userId,
      status: 'connected',
      integrationMode: 'oauth',
      credentialRef: `users/${uid}/metaTokens/threads`,
      accessToken: encryptToken(accessToken),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  await batch.commit();

  return NextResponse.redirect(new URL(`/app/connect?success=threads&workspaceId=${workspaceId || ''}`, req.url));
}
