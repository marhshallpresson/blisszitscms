const LI_AUTH_URL  = 'https://www.linkedin.com/oauth/v2/authorization';
const LI_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LI_API       = 'https://api.linkedin.com/v2';

export function buildLinkedInAuthUrl(state: string): string {
  return `${LI_AUTH_URL}?` + new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/linkedin`,
    scope: [
      'r_organization_social',
      'w_organization_social',
      'w_member_social',
      'rw_organization_admin',
    ].join(' '),
    state,
  });
}

export async function exchangeLinkedInCode(code: string): Promise<{
  accessToken: string;
  expiresAt: number;
}> {
  const res = await fetch(LI_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/linkedin`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`LinkedIn token exchange: ${data.error_description}`);
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Auto-discovers all LinkedIn Organization Pages the user administers.
 * This is the "one-click" magic — no manual page selection needed.
 * Uses rw_organization_admin to call Organization ACLs.
 */
export async function discoverLinkedInOrganizations(accessToken: string): Promise<Array<{
  urn: string;           // urn:li:organization:12345
  name: string;
  logoUrl: string | null;
  vanityName?: string;
}>> {
  // Step 1: Fetch all ACL entries where user is admin
  const aclRes = await fetch(
    `${LI_API}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED` +
    `&projection=(elements*(organization~(id,name,logoV2(original~:playableStreams)),role,state))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );
  const { elements } = await aclRes.json();
  if (!elements?.length) return [];

  // Step 2: Hydrate each org with logo + vanity name
  const orgs = await Promise.all(
    elements
      .filter((el: any) => el.state === 'APPROVED')
      .map(async (el: any) => {
        const orgId = el['organization~']?.id ?? el.organization?.split(':').pop();
        const urn = `urn:li:organization:${orgId}`;
        const name = el['organization~']?.name?.localized?.en_US
          ?? el['organization~']?.name?.preferredLocale?.country
          ?? 'Unknown Organization';

        // Fetch logo separately for full URL
        let logoUrl: string | null = null;
        try {
          const logoData = el['organization~']?.logoV2?.['original~']?.elements?.[0]
            ?.identifiers?.[0]?.identifier;
          logoUrl = logoData ?? null;
        } catch { /* logo optional */ }

        return { urn, name, logoUrl, orgId };
      })
  );

  return orgs;
}
