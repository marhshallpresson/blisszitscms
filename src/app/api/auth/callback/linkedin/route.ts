import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';
import { exchangeLinkedInCode, discoverLinkedInOrganizations } from '@/lib/linkedin/oauth';

const LI_API = 'https://api.linkedin.com/v2';

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

  if (error) {
    return NextResponse.redirect(
      new URL(`/app/connect?error=${searchParams.get('error_description') ?? error}`, req.url)
    );
  }

  const { accessToken, expiresAt } = await exchangeLinkedInCode(code!);

  // Get LinkedIn member profile (for display name)
  const profileRes = await fetch(
    `${LI_API}/me?projection=(id,localizedFirstName,localizedLastName)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const profile = await profileRes.json();
  const memberId = `urn:li:person:${profile.id}`;
  const displayName = `${profile.localizedFirstName} ${profile.localizedLastName}`;

  // Auto-discover all org pages user administers
  const organizations = await discoverLinkedInOrganizations(accessToken);

  const session = req.cookies.get('session')?.value!;
  const { uid } = await adminAuth.verifySessionCookie(session);

  const batch = adminDb.batch();

  // Centralized user token
  batch.set(adminDb.doc(`users/${uid}/linkedinTokens/main`), {
    memberId,
    displayName,
    accessToken: encryptToken(accessToken),
    expiresAt,
    connectedAt: Date.now(),
    platform: 'linkedin',
  });

  // Store each discovered organization
  for (const org of organizations) {
    const docId = org.urn.replace(/:/g, '_');
    // User-centric backup
    batch.set(adminDb.doc(`users/${uid}/connectedOrgs/${docId}`), {
      urn: org.urn,
      orgId: org.urn.split(':').pop(),
      name: org.name,
      logoUrl: org.logoUrl,
      platform: 'linkedin',
      connectedAt: Date.now(),
    });

    // Workspace-centric storage
    if (workspaceId) {
      const socialAccountRef = adminDb.doc(`workspaces/${workspaceId}/social_accounts/li_${docId}`);
      batch.set(socialAccountRef, {
        workspaceId,
        network: 'linkedin',
        accountName: org.name,
        accountExternalId: org.urn, // LinkedIn uses URNs
        status: 'connected',
        integrationMode: 'oauth',
        credentialRef: `users/${uid}/linkedinTokens/main`,
        accessToken: encryptToken(accessToken), // Store user token here for easy backend access
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  }

  await batch.commit();

  return NextResponse.redirect(
    new URL(`/app/connect?success=linkedin&orgs=${organizations.length}&workspaceId=${workspaceId || ''}`, req.url)
  );
}
