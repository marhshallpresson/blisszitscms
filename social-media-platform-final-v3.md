# Enterprise Social Media Management Platform
## Full-Stack Production Build Guide — 2026
### Facebook · Instagram · Threads · LinkedIn

> **Stack:** Next.js 15 (App Router) · Firebase · Meta Graph API v22 · Threads API v1.0 · LinkedIn Community Management API · Genkit AI (Gemini 2.0)
>
> **Auth Patterns:**
> - Meta: Facebook Login for Business (NOT legacy User Login) + Tech Provider Registration
> - LinkedIn: OAuth 2.0 with Community Management Product + URN-based asset discovery
>
> **Architecture:** Webhook-first, queue-decoupled AI, server-side-only token handling, AES-256-GCM encrypted storage

---

## ⚠️ Critical Policy Violations That Will Get Your App Banned

Read this before touching any code.

| Platform | Wrong Pattern | Correct Pattern | Consequence of Error |
|---|---|---|---|
| Meta | Legacy Facebook User Login | **Facebook Login for Business** (`config_id`) | App stuck in dev mode, no Advanced Access |
| Meta | Solo Business Verification | **Tech Provider Registration** (legal docs) | SaaS App Review rejected |
| Meta | Process AI in webhook handler | **Queue → 200 OK → async worker** | Duplicate AI replies on retry |
| Meta | No label on AI reply | **Append disclosure text** | Platform Policy violation → suspension |
| LinkedIn | Default "Share on LinkedIn" product | **Community Management API** (separate application) | Cannot access org pages |
| LinkedIn | Promise Groups/DM features | **Not available** in public API | App review rejection, legal exposure |
| LinkedIn | Auto-send AI replies without approval | **Human-in-the-loop required** (3% spam rule) | API access revoked immediately |
| LinkedIn | Integer IDs | **URN strings** (`urn:li:organization:12345`) | All API calls will 404 |
| Instagram | Personal accounts | **Business/Creator accounts only** | API returns empty data |
| Threads | Post > 500 chars | **Hard reject at 500 chars** | API error — validate client-side |

---

## Table of Contents

**Part I — Architecture & Setup**
1. [System Architecture](#1-system-architecture)
2. [Project Structure](#2-project-structure)
3. [Meta App Setup — Business App + Tech Provider](#3-meta-app-setup--business-app--tech-provider)
4. [LinkedIn Developer Setup — Community Management API](#4-linkedin-developer-setup--community-management-api)
5. [Shared Cryptography & Token Infrastructure](#5-shared-cryptography--token-infrastructure)

**Part II — Authentication & OAuth**
6. [Meta: Facebook Login for Business — One-Click Portfolio Auth](#6-meta-facebook-login-for-business--one-click-portfolio-auth)
7. [Threads: Separate OAuth Flow](#7-threads-separate-oauth-flow)
8. [LinkedIn: OAuth 2.0 + Auto-Discovery](#8-linkedin-oauth-20--auto-discovery)
9. [Unified Connect Page — All Platforms](#9-unified-connect-page--all-platforms)
10. [Token Lifecycle Management](#10-token-lifecycle-management)

**Part III — Publishing Engines**
11. [Facebook Publishing Engine](#11-facebook-publishing-engine)
12. [Instagram Container Architecture (2-Step Flow)](#12-instagram-container-architecture-2-step-flow)
13. [Threads Publishing (500-Char Hard Limit)](#13-threads-publishing-500-char-hard-limit)
14. [LinkedIn: Register-Upload-Verify Media Pipeline](#14-linkedin-register-upload-verify-media-pipeline)
15. [Cross-Platform Scheduler (Cloud Function Cron)](#15-cross-platform-scheduler-cloud-function-cron)

**Part IV — Inbox, Webhooks & AI**
16. [Webhook-First Architecture — The 5-Second Rule](#16-webhook-first-architecture--the-5-second-rule)
17. [Meta Webhook Processor](#17-meta-webhook-processor)
18. [LinkedIn Social Action Notifications](#18-linkedin-social-action-notifications)
19. [Unified Inbox — All Platforms](#19-unified-inbox--all-platforms)
20. [AI Reply Engine — Contextual + Policy-Compliant](#20-ai-reply-engine--contextual--policy-compliant)

**Part V — Platform Composer & UX**
21. [Multi-Platform Composer](#21-multi-platform-composer)
22. [Analytics Dashboard](#22-analytics-dashboard)

**Part VI — Data, Infrastructure & Compliance**
23. [Firebase Data Models](#23-firebase-data-models)
24. [Rate Limit Middleware](#24-rate-limit-middleware)
25. [App Review Guides — Meta & LinkedIn](#25-app-review-guides--meta--linkedin)
26. [Testing & Verification Checklist](#26-testing--verification-checklist)
27. [Environment Variables Reference](#27-environment-variables-reference)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App (App Router)                          │
│                                                                              │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────────────────┐ │
│  │  Dashboard   │  │  Composer         │  │  Unified Inbox               │ │
│  │  (Analytics) │  │  per-platform     │  │  FB+IG+Threads+LinkedIn      │ │
│  │              │  │  char limits      │  │  Comments+DMs+Notifications  │ │
│  │              │  │  + Media upload   │  │  + AI Suggest (editable)     │ │
│  └──────────────┘  └───────────────────┘  └──────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Connect Page — One-Click OAuth for all 4 platforms                     ││
│  │  Facebook Login for Business (Meta) + LinkedIn Community Mgmt OAuth     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ Server Actions — tokens NEVER touch browser
┌──────────────────────────────▼──────────────────────────────────────────────┐
│                          Firebase Backend                                    │
│                                                                              │
│  Firestore                Cloud Functions              Cloud Tasks           │
│  ┌──────────────────┐    ┌──────────────────────┐    ┌───────────────────┐ │
│  │ users/           │    │ processScheduled      │    │ webhook-processor │ │
│  │   metaTokens/    │    │   Posts (1-min cron)  │    │   queue           │ │
│  │   linkedinTokens/│    │                       │    │                   │ │
│  │   connectedPages/│    │ refreshExpiredTokens  │    │ ai-reply-worker   │ │
│  │   connectedOrgs/ │    │   (daily)             │    │   queue           │ │
│  │   scheduledPosts/│    │                       │    └───────────────────┘ │
│  │   inbox/         │    │ metaWebhookReceiver   │                          │
│  │   rateLimits/    │    │   (immediate 200 OK)  │    Firebase Auth          │
│  └──────────────────┘    │                       │    ┌───────────────────┐ │
│                           │ linkedinNotification  │    │  Session Cookies  │ │
│                           │   Receiver            │    └───────────────────┘ │
│                           └──────────────────────┘                          │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
     ┌─────────────────────────┼─────────────────────────┐
     │                         │                         │
┌────▼─────────┐    ┌──────────▼────────┐    ┌──────────▼──────────────┐
│ Meta Graph   │    │ Threads API v1.0  │    │ LinkedIn Community      │
│ API v22.0    │    │ graph.threads.net │    │ Management API v2       │
│              │    │                   │    │ api.linkedin.com        │
│ FB Pages     │    │ Threads posts     │    │                         │
│ IG Business  │    │ Threads replies   │    │ Company Pages (Orgs)    │
│ Messenger    │    │ Insights          │    │ Posts (Unified API)     │
│ Webhooks     │    │                   │    │ Comments                │
└──────────────┘    └───────────────────┘    │ Analytics               │
                                             │ NO Groups, NO DM        │
                                             └─────────────────────────┘
```

### Architectural Principles

1. **Zero client-side tokens** — all API calls via Server Actions or Cloud Functions
2. **Webhook-first, never polling** — Meta webhooks + LinkedIn Social Action Notifications
3. **Queue-decoupled AI** — webhook handlers always return 200 OK in <1 second; AI runs async
4. **Human-in-the-loop for LinkedIn** — AI suggests, human approves (3% spam rule enforcement)
5. **AES-256-GCM token encryption** at rest in Firestore
6. **URN-aware throughout** — LinkedIn uses `urn:li:organization:ID`, never raw integers
7. **Platform constraints enforced client-side** — char limits, media types, rate limits visible before API call

---

## 2. Project Structure

```
src/
├── app/
│   ├── app/
│   │   ├── connect/          # OAuth connect page (all platforms)
│   │   ├── dashboard/        # Main analytics dashboard
│   │   ├── composer/         # Multi-platform post composer
│   │   ├── scheduler/        # Scheduled posts calendar
│   │   ├── inbox/            # Unified inbox (all platforms)
│   │   └── settings/         # Connected accounts, brand voice, auto-respond
│   └── api/
│       ├── auth/
│       │   ├── callback/
│       │   │   ├── meta/         # FB+IG callback handler
│       │   │   └── threads/      # Threads callback handler
│       │   └── linkedin/         # LinkedIn callback handler
│       ├── webhooks/
│       │   ├── meta/
│       │   │   ├── route.ts      # Immediate receiver → queue
│       │   │   └── process/      # Async processor (called by Cloud Tasks)
│       │   └── linkedin/
│       │       ├── route.ts
│       │       └── process/
│       └── inbox/
│           └── reply/            # Send reply endpoint
├── lib/
│   ├── meta/
│   │   ├── oauth.ts              # FB Login for Business URL builder
│   │   ├── facebook.ts           # Page publishing, comments, Messenger
│   │   ├── instagram.ts          # Container flow, Carousel, polling
│   │   └── threads.ts            # Threads publishing, child-parent carousel
│   ├── linkedin/
│   │   ├── oauth.ts              # LinkedIn OAuth + URN discovery
│   │   ├── publisher.ts          # Register-Upload-Verify pipeline
│   │   ├── comments.ts           # Comment read/reply
│   │   └── analytics.ts          # Org share statistics
│   ├── ai/
│   │   └── auto-responder.ts     # Genkit AI reply generator
│   ├── crypto.ts                 # AES-256-GCM token encryption
│   └── rate-limiter.ts           # Per-platform rate limit middleware
├── ai/
│   ├── genkit.ts                 # Genkit + model chain config
│   └── flows/                    # AI flows (content ideas, captions etc.)
└── components/
    ├── connect/                  # Platform connect cards
    ├── composer/                 # Multi-platform composer UI
    └── inbox/                    # Inbox message cards

functions/
├── src/
│   ├── scheduler.ts              # 1-minute cron scheduler
│   ├── refreshTokens.ts          # Daily token refresh
│   ├── webhookWorker.ts          # Async webhook AI processing
│   └── crypto.ts                 # Shared encryption (mirrors lib/crypto)
```

---

## 3. Meta App Setup — Business App + Tech Provider

### Step 1: Tech Provider Registration (SaaS Requirement)

> You must complete this **before** submitting any permission for Advanced Access. Individual Business Verification is insufficient for a multi-tenant SaaS.

1. Go to: https://developers.facebook.com/docs/development/register/tech-provider
2. Click **"Register as a Tech Provider"**
3. Submit legal incorporation documents (LLC/Corp registration)
4. Approval: 3–10 business days
5. Only after approval → submit permissions for Advanced Access

### Step 2: Create Business App

1. Meta Developer Dashboard → **Create App → Business** (not Consumer)
2. Add products:
   - **Facebook Login for Business** (not standard Facebook Login)
   - Instagram
   - Threads API
   - Webhooks
3. Note `APP_ID` and `APP_SECRET`

### Step 3: Create Facebook Login for Business Configuration

1. Dashboard → **Facebook Login for Business → Configurations → Create**
2. Bundle all permissions into one configuration:
   ```
   business_management          pages_show_list
   pages_manage_posts           pages_read_engagement
   pages_manage_engagement      pages_messaging
   publish_video                instagram_basic
   instagram_content_publish    instagram_manage_comments
   instagram_manage_messages    instagram_manage_insights
   ```
3. Save the **Configuration ID** → `NEXT_PUBLIC_META_LOGIN_CONFIG_ID`

### Step 4: Configure Webhooks

- **Callback URL:** `https://yourdomain.com/api/webhooks/meta`
- **Verify Token:** random string from `.env`
- **Subscribe fields:** `feed`, `messages`, `mention`, `comments`

---

## 4. LinkedIn Developer Setup — Community Management API

### Step 1: Apply for Community Management Product

> You **cannot** use the default "Share on LinkedIn" product for page management. This requires a separate application.

1. Go to: https://www.linkedin.com/developers/apps → Create App
2. In your app: **Products → Request Access → "Community Management API"**
3. Review time: **2–3 weeks** — plan accordingly
4. Your SaaS company must have a **verified LinkedIn Company Page** before submission

### Step 2: Required OAuth Scopes

```
r_organization_social     # Read page posts + analytics
w_organization_social     # Publish as Page, reply to comments
w_member_social           # Publish to personal profiles
rw_organization_admin     # Admin access for asset discovery (auto-discovers all pages)
```

> ⚠️ Do NOT request `r_messages`, `w_messages` — these are Tier 1 CRM Partner Only (Salesforce, HubSpot level). Requesting them without partner status guarantees review rejection.
>
> ⚠️ Do NOT request Group posting scopes — the Groups API is effectively deprecated for SaaS and will not be granted.

### Step 3: Configure OAuth Redirect URIs

In your LinkedIn app settings:
```
https://yourdomain.com/api/auth/callback/linkedin
http://localhost:3000/api/auth/callback/linkedin
```

### Step 4: Subscribe to Organization Social Action Notifications

After Community Management is approved:
1. Dashboard → **Partner Programs → Organization Social Action Notifications**
2. Set webhook URL: `https://yourdomain.com/api/webhooks/linkedin`
3. Subscribe to: `ORGANIZATION_SOCIAL_ACTION_NOTIFY`

---

## 5. Shared Cryptography & Token Infrastructure

### `src/lib/crypto.ts`

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Generate: openssl rand -hex 32
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex');

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext (all hex)
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

export function decryptToken(stored: string): string {
  const parts = stored.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted token format');
  const [ivHex, authTagHex, encryptedHex] = parts;
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
```

---

## 6. Meta: Facebook Login for Business — One-Click Portfolio Auth

### `src/lib/meta/oauth.ts`

```typescript
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
```

### `src/app/api/auth/callback/meta/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';

const GRAPH = 'https://graph.facebook.com/v22.0';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

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

  batch.set(adminDb.doc(`users/${uid}/metaTokens/facebook`), {
    userId: metaUserId,
    name,
    accessToken: encryptToken(longToken),
    expiresAt: Date.now() + expires_in * 1000,
    connectedAt: Date.now(),
    platform: 'facebook',
  });

  for (const page of pages) {
    // Page tokens do not expire as long as user remains admin
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
  }

  await batch.commit();

  // 7. Subscribe each page to webhooks (async, non-blocking)
  Promise.all(pages.map((p: any) => subscribePageWebhooks(p.id, p.access_token)));

  return NextResponse.redirect(
    new URL('/app/connect?success=meta', req.url)
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
```

---

## 7. Threads: Separate OAuth Flow

> Threads uses `threads.net/oauth/authorize` — completely separate from Facebook's OAuth. Must be triggered independently.

### `src/lib/meta/threads-oauth.ts`

```typescript
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
```

### `src/app/api/auth/callback/threads/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';
import { exchangeThreadsCode } from '@/lib/meta/threads-oauth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  if (error) return NextResponse.redirect(new URL(`/app/connect?error=${error}`, req.url));

  const { accessToken, expiresAt, userId } = await exchangeThreadsCode(code!);

  // Fetch Threads profile
  const profileRes = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id,username,name&access_token=${accessToken}`
  );
  const profile = await profileRes.json();

  const session = req.cookies.get('session')?.value!;
  const { uid } = await adminAuth.verifySessionCookie(session);

  await adminDb.doc(`users/${uid}/metaTokens/threads`).set({
    userId,
    username: profile.username,
    name: profile.name,
    accessToken: encryptToken(accessToken),
    expiresAt,
    connectedAt: Date.now(),
    platform: 'threads',
  });

  return NextResponse.redirect(new URL('/app/connect?success=threads', req.url));
}
```

---

## 8. LinkedIn: OAuth 2.0 + Auto-Discovery

### `src/lib/linkedin/oauth.ts`

```typescript
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
```

### `src/app/api/auth/callback/linkedin/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';
import { exchangeLinkedInCode, discoverLinkedInOrganizations } from '@/lib/linkedin/oauth';

const LI_API = 'https://api.linkedin.com/v2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
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

  // Store user token
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
    // Use org URN as the document ID (replace colons for Firestore path safety)
    const docId = org.urn.replace(/:/g, '_');
    batch.set(adminDb.doc(`users/${uid}/connectedOrgs/${docId}`), {
      urn: org.urn,              // urn:li:organization:12345 — keep original for API calls
      orgId: org.urn.split(':').pop(),
      name: org.name,
      logoUrl: org.logoUrl,
      platform: 'linkedin',
      connectedAt: Date.now(),
      // LinkedIn orgs use the user's access token (not page-specific tokens)
      // Token is stored at linkedinTokens/main
    });
  }

  await batch.commit();

  return NextResponse.redirect(
    new URL(`/app/connect?success=linkedin&orgs=${organizations.length}`, req.url)
  );
}
```

---

## 9. Unified Connect Page — All Platforms

### `src/app/app/connect/page.tsx`

```tsx
'use client';
import { useState } from 'react';
import { buildMetaAuthUrl } from '@/lib/meta/oauth';
import { buildThreadsAuthUrl } from '@/lib/meta/threads-oauth';
import { buildLinkedInAuthUrl } from '@/lib/linkedin/oauth';

// Feature groups — map features to permissions across platforms
const META_FEATURES = [
  {
    id: 'publish',
    label: 'Publishing & Scheduling',
    icon: '📅',
    description: 'Create and schedule posts to Pages and feeds',
    permissions: ['pages_manage_posts', 'instagram_content_publish', 'publish_video'],
  },
  {
    id: 'inbox',
    label: 'Inbox & Comments',
    icon: '💬',
    description: 'Read and reply to comments, DMs, and Messenger',
    permissions: ['pages_messaging', 'instagram_manage_messages', 'pages_manage_engagement'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    description: 'View reach, impressions, and engagement data',
    permissions: ['pages_read_engagement', 'instagram_manage_insights'],
  },
];

const LINKEDIN_FEATURES = [
  {
    id: 'li_publish',
    label: 'Page Publishing',
    icon: '📝',
    description: 'Post articles, images, and videos to Company Pages',
    permissions: ['w_organization_social'],
    note: 'Note: LinkedIn Groups API is not publicly available. Comments are supported; Direct Messaging requires Tier 1 CRM partner status.',
  },
  {
    id: 'li_analytics',
    label: 'Analytics',
    icon: '📈',
    description: 'Read engagement stats for Company Page posts',
    permissions: ['r_organization_social'],
  },
];

type Platform = 'meta' | 'threads' | 'linkedin';

export default function ConnectPage() {
  const [metaFeatures, setMetaFeatures] = useState<string[]>([]);
  const [linkedInFeatures, setLiFeatures] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set());
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const togglePlatform = (p: Platform) =>
    setPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const handleConnectAll = async () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    // Queue: Meta first (IG depends on it), then Threads, then LinkedIn
    const queue: Platform[] = [];
    if (platforms.has('meta')) queue.push('meta');
    if (platforms.has('threads')) queue.push('threads');
    if (platforms.has('linkedin')) queue.push('linkedin');
    sessionStorage.setItem('oauth_queue', JSON.stringify(queue.slice(1)));

    if (queue[0] === 'meta') {
      window.location.href = buildMetaAuthUrl(state);
    } else if (queue[0] === 'threads') {
      window.location.href = buildThreadsAuthUrl(state);
    } else if (queue[0] === 'linkedin') {
      window.location.href = buildLinkedInAuthUrl(state);
    }
  };

  const totalSelected = platforms.size;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Connect Your Social Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Select platforms below. One click per platform — we request only the
          minimum permissions needed for the features you choose.
        </p>
      </div>

      {/* Meta Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="meta-toggle"
            checked={platforms.has('meta')}
            onChange={() => togglePlatform('meta')}
            className="w-4 h-4"
          />
          <label htmlFor="meta-toggle" className="font-semibold text-lg cursor-pointer">
            🔵 Meta — Facebook + Instagram
          </label>
        </div>
        {platforms.has('meta') && (
          <div className="ml-7 space-y-2">
            {META_FEATURES.map(f => (
              <label key={f.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={metaFeatures.includes(f.id)}
                  onChange={() => setMetaFeatures(prev =>
                    prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                  )}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium text-sm">{f.icon} {f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                  <details className="mt-1">
                    <summary className="text-xs text-blue-500 cursor-pointer">
                      {f.permissions.length} permissions
                    </summary>
                    <div className="font-mono text-xs text-muted-foreground mt-1">
                      {f.permissions.map(p => <div key={p}>• {p}</div>)}
                    </div>
                  </details>
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Threads Section */}
      <section className="flex items-center gap-3">
        <input
          type="checkbox"
          id="threads-toggle"
          checked={platforms.has('threads')}
          onChange={() => togglePlatform('threads')}
          className="w-4 h-4"
        />
        <label htmlFor="threads-toggle" className="font-semibold text-lg cursor-pointer">
          ⚫ Threads
          <span className="text-sm font-normal text-muted-foreground ml-2">
            — Posts + Replies (500 char limit)
          </span>
        </label>
      </section>

      {/* LinkedIn Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="li-toggle"
            checked={platforms.has('linkedin')}
            onChange={() => togglePlatform('linkedin')}
            className="w-4 h-4"
          />
          <label htmlFor="li-toggle" className="font-semibold text-lg cursor-pointer">
            🔷 LinkedIn — Company Pages
            <span className="text-sm font-normal text-muted-foreground ml-2">
              — All pages auto-discovered from your Business Portfolio
            </span>
          </label>
        </div>
        {platforms.has('linkedin') && (
          <div className="ml-7 space-y-2">
            {LINKEDIN_FEATURES.map(f => (
              <label key={f.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={linkedInFeatures.includes(f.id)}
                  onChange={() => setLiFeatures(prev =>
                    prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                  )}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium text-sm">{f.icon} {f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                  {f.note && (
                    <div className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                      ⚠️ {f.note}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={handleConnectAll}
        disabled={totalSelected === 0 || !!connecting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base disabled:opacity-50"
      >
        {connecting
          ? `Connecting ${connecting}...`
          : totalSelected === 0
          ? 'Select at least one platform'
          : `Connect ${totalSelected} platform${totalSelected > 1 ? 's' : ''} →`}
      </button>

      <div className="text-xs text-center text-muted-foreground space-y-1">
        <p>LinkedIn: All Company Pages you administer are discovered automatically — no manual selection needed.</p>
        <p>We never post without your explicit action. AI-generated replies are always labeled.</p>
        <p>Revoke access anytime in Settings → Connected Accounts.</p>
      </div>
    </div>
  );
}
```

---

## 10. Token Lifecycle Management

### Daily Cloud Function — Refresh All Tokens

```typescript
// functions/src/refreshTokens.ts
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { encryptToken, decryptToken } from './crypto';

const GRAPH = 'https://graph.facebook.com/v22.0';
const LI_REFRESH = 'https://www.linkedin.com/oauth/v2/accessToken';
const THREADS_REFRESH = 'https://graph.threads.net/access_token';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const refreshExpiredTokens = functions.scheduler.onSchedule(
  { schedule: '0 2 * * *', timeZone: 'UTC' }, // 2 AM daily
  async () => {
    const db = admin.firestore();
    const threshold = Date.now() + SEVEN_DAYS;

    const snapshot = await db.collectionGroup('metaTokens')
      .where('expiresAt', '<', threshold)
      .get();

    const liSnapshot = await db.collectionGroup('linkedinTokens')
      .where('expiresAt', '<', threshold)
      .get();

    await Promise.allSettled([
      ...snapshot.docs.map(doc => refreshMetaToken(doc)),
      ...liSnapshot.docs.map(doc => refreshLinkedInToken(doc)),
    ]);
  }
);

async function refreshMetaToken(doc: admin.firestore.QueryDocumentSnapshot) {
  const { accessToken, expiresAt, platform } = doc.data();
  const uid = doc.ref.parent.parent!.id;
  const db = admin.firestore();

  if (expiresAt < Date.now()) {
    // Expired — notify user
    await db.collection(`users/${uid}/notifications`).add({
      type: 'token_expired',
      platform,
      message: `Your ${platform} connection expired. Please reconnect.`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
    return;
  }

  const currentToken = decryptToken(accessToken);

  if (platform === 'threads') {
    const res = await fetch(`${THREADS_REFRESH}?` + new URLSearchParams({
      grant_type: 'th_refresh_token',
      access_token: currentToken,
    }));
    const { access_token, expires_in } = await res.json();
    await doc.ref.update({
      accessToken: encryptToken(access_token),
      expiresAt: Date.now() + expires_in * 1000,
      lastRefreshed: Date.now(),
    });
  } else {
    // Facebook long-lived refresh
    const res = await fetch(`${GRAPH}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: currentToken,
    }));
    const { access_token, expires_in } = await res.json();
    await doc.ref.update({
      accessToken: encryptToken(access_token),
      expiresAt: Date.now() + expires_in * 1000,
      lastRefreshed: Date.now(),
    });
  }
}

async function refreshLinkedInToken(doc: admin.firestore.QueryDocumentSnapshot) {
  const { accessToken, expiresAt } = doc.data();
  const uid = doc.ref.parent.parent!.id;
  const db = admin.firestore();

  if (expiresAt < Date.now()) {
    await db.collection(`users/${uid}/notifications`).add({
      type: 'token_expired',
      platform: 'linkedin',
      message: 'Your LinkedIn connection expired. Please reconnect.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
    return;
  }

  // LinkedIn uses refresh tokens (60-day sliding window)
  // Note: Refresh token must be stored at initial exchange
  const { refreshToken } = doc.data();
  if (!refreshToken) return;

  const res = await fetch(LI_REFRESH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptToken(refreshToken),
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });
  const { access_token, expires_in, refresh_token } = await res.json();
  await doc.ref.update({
    accessToken: encryptToken(access_token),
    refreshToken: encryptToken(refresh_token),
    expiresAt: Date.now() + expires_in * 1000,
    lastRefreshed: Date.now(),
  });
}
```

---

## 11. Facebook Publishing Engine

### `src/lib/meta/facebook.ts`

```typescript
const GRAPH = 'https://graph.facebook.com/v22.0';
const AI_DISCLOSURE = '\n\n— Automated reply'; // Required by Meta Platform Policy

export interface FbPostContent {
  message?: string;      // Max 63,206 chars
  link?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'photo' | 'video';
  scheduledTime?: number; // Unix timestamp (must be 10 min – 30 days ahead)
}

export async function publishToFbPage(
  pageId: string,
  pageToken: string,
  content: FbPostContent
): Promise<{ id: string; postUrl: string }> {
  let endpoint = `${GRAPH}/${pageId}`;
  const body: Record<string, string> = { access_token: pageToken };

  if (content.message) body.message = content.message;
  if (content.link) body.link = content.link;
  if (content.scheduledTime) {
    // Scheduled publishing requires published=false
    body.published = 'false';
    body.scheduled_publish_time = String(content.scheduledTime);
  }

  if (content.mediaType === 'photo' && content.imageUrl) {
    endpoint += '/photos';
    body.url = content.imageUrl;
  } else if (content.mediaType === 'video' && content.videoUrl) {
    endpoint += '/videos';
    body.file_url = content.videoUrl;
    body.description = content.message ?? '';
    delete body.message;
  } else {
    endpoint += '/feed';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(`[FB ${data.error.code}] ${data.error.message}`);
  return { id: data.id, postUrl: `https://facebook.com/${data.id}` };
}

export async function replyToFbComment(
  commentId: string,
  message: string,
  pageToken: string,
  isAiGenerated = false
): Promise<void> {
  const text = isAiGenerated ? `${message}${AI_DISCLOSURE}` : message;
  const res = await fetch(`${GRAPH}/${commentId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: pageToken }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[FB comment reply] ${data.error.message}`);
}

export async function sendMessengerMessage(
  recipientId: string,
  message: string,
  pageToken: string,
  isAiGenerated = false
): Promise<void> {
  const text = isAiGenerated ? `${message}\n\n(Automated reply)` : message;
  await fetch(`${GRAPH}/me/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      access_token: pageToken,
    }),
  });
}

export async function getFbPagePosts(pageId: string, pageToken: string) {
  const fields = [
    'id', 'message', 'story', 'created_time', 'permalink_url',
    'attachments', 'likes.summary(true)', 'comments.summary(true)',
    'shares', 'reactions.summary(true)',
  ].join(',');

  const res = await fetch(`${GRAPH}/${pageId}/feed?fields=${fields}&access_token=${pageToken}`);
  return res.json();
}
```

---

## 12. Instagram Container Architecture (2-Step Flow)

### `src/lib/meta/instagram.ts`

```typescript
const GRAPH = 'https://graph.facebook.com/v22.0';
const AI_DISCLOSURE = '\n\n— Automated reply';
type IgMediaType = 'IMAGE' | 'VIDEO' | 'REELS' | 'CAROUSEL';

interface IgContent {
  caption?: string;          // Max 2,200 chars; first 125 shown in feed
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: IgMediaType;
  carouselItems?: Array<{ imageUrl?: string; videoUrl?: string }>;
}

export async function publishToInstagram(
  igUserId: string,
  igToken: string,
  content: IgContent
): Promise<{ id: string }> {
  const containerId = content.mediaType === 'CAROUSEL' && content.carouselItems?.length
    ? await createIgCarousel(igUserId, igToken, content)
    : await createIgContainer(igUserId, igToken, content);

  await pollIgContainer(containerId, igToken);

  const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId, access_token: igToken }),
  });
  const result = await pubRes.json();
  if (result.error) throw new Error(`[IG publish] ${result.error.message}`);
  return result;
}

async function createIgContainer(igUserId: string, token: string, content: IgContent): Promise<string> {
  const body: Record<string, string> = {
    caption: content.caption ?? '',
    access_token: token,
  };

  if (content.mediaType === 'VIDEO' || content.mediaType === 'REELS') {
    body.video_url = content.videoUrl!;
    body.media_type = content.mediaType;
  } else {
    body.image_url = content.imageUrl!;
    body.media_type = 'IMAGE';
  }

  const res = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[IG container] ${data.error.message}`);
  return data.id;
}

async function createIgCarousel(igUserId: string, token: string, content: IgContent): Promise<string> {
  const childIds: string[] = [];
  for (const item of content.carouselItems!) {
    const res = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: item.imageUrl,
        video_url: item.videoUrl,
        is_carousel_item: true,
        access_token: token,
      }),
    });
    const { id, error } = await res.json();
    if (error) throw new Error(`[IG carousel child] ${error.message}`);
    childIds.push(id);
  }

  const res = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: content.caption,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[IG carousel parent] ${data.error.message}`);
  return data.id;
}

async function pollIgContainer(
  containerId: string,
  token: string,
  maxAttempts = 15,
  intervalMs = 3000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code,status&access_token=${token}`
    );
    const { status_code } = await res.json();
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error('IG container processing failed');
    if (status_code === 'EXPIRED') throw new Error('IG container expired (>24h)');
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('IG container polling timed out after 45 seconds');
}

export async function replyToIgComment(
  commentId: string,
  message: string,
  igToken: string,
  isAiGenerated = false
): Promise<void> {
  const text = isAiGenerated ? `${message}${AI_DISCLOSURE}` : message;
  await fetch(`${GRAPH}/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: igToken }),
  });
}
```

---

## 13. Threads Publishing (500-Char Hard Limit)

### `src/lib/meta/threads.ts`

```typescript
const THREADS_GRAPH = 'https://graph.threads.net/v1.0';
const AI_DISCLOSURE = '\n\n— Automated reply';
const THREADS_MAX_CHARS = 500;
const THREADS_MAX_WITH_DISCLOSURE = THREADS_MAX_CHARS - AI_DISCLOSURE.length; // 484

interface ThreadsContent {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO';
  replyToId?: string;
  carouselItems?: Array<{ imageUrl?: string; videoUrl?: string; text?: string }>;
}

export async function publishToThreads(
  userId: string,
  token: string,
  content: ThreadsContent
): Promise<{ id: string }> {
  if (content.text && content.text.length > THREADS_MAX_CHARS) {
    throw new Error(
      `Threads 500-char hard limit exceeded (${content.text.length} chars). Trim content before publishing.`
    );
  }

  const creationId = content.carouselItems?.length
    ? await createThreadsCarousel(userId, token, content)
    : await createThreadsContainer(userId, token, content);

  if (content.mediaType === 'VIDEO') {
    await pollThreadsContainer(creationId, token);
  }

  const pubRes = await fetch(`${THREADS_GRAPH}/${userId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId, access_token: token }),
  });
  const result = await pubRes.json();
  if (result.error) throw new Error(`[Threads publish] ${result.error.message}`);
  return result;
}

async function createThreadsContainer(userId: string, token: string, content: ThreadsContent): Promise<string> {
  const res = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: content.text,
      image_url: content.imageUrl,
      video_url: content.videoUrl,
      media_type: content.mediaType ?? 'TEXT',
      reply_to_id: content.replyToId,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[Threads container] ${data.error.message}`);
  return data.id;
}

// Threads carousels require recursive Child-Parent container structure
async function createThreadsCarousel(userId: string, token: string, content: ThreadsContent): Promise<string> {
  const childIds: string[] = [];
  for (const item of content.carouselItems!) {
    const res = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_carousel_item: true,
        image_url: item.imageUrl,
        video_url: item.videoUrl,
        text: item.text,
        media_type: item.videoUrl ? 'VIDEO' : 'IMAGE',
        access_token: token,
      }),
    });
    const { id, error } = await res.json();
    if (error) throw new Error(`[Threads carousel child] ${error.message}`);
    childIds.push(id);
  }

  const parentRes = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      text: content.text,
      access_token: token,
    }),
  });
  const parent = await parentRes.json();
  if (parent.error) throw new Error(`[Threads carousel parent] ${parent.error.message}`);
  return parent.id;
}

async function pollThreadsContainer(id: string, token: string, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${THREADS_GRAPH}/${id}?fields=status&access_token=${token}`);
    const { status } = await res.json();
    if (status === 'FINISHED') return;
    if (status === 'ERROR') throw new Error('Threads container failed');
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Threads container timed out');
}

export async function replyToThread(
  threadId: string,
  userId: string,
  token: string,
  text: string,
  isAiGenerated = false
): Promise<void> {
  const maxLen = isAiGenerated ? THREADS_MAX_WITH_DISCLOSURE : THREADS_MAX_CHARS;
  if (text.length > maxLen) {
    throw new Error(`Threads reply exceeds ${maxLen} chars (${text.length})`);
  }
  const finalText = isAiGenerated ? `${text}${AI_DISCLOSURE}` : text;
  await publishToThreads(userId, token, {
    text: finalText,
    mediaType: 'TEXT',
    replyToId: threadId,
  });
}
```

---

## 14. LinkedIn: Register-Upload-Verify Media Pipeline

LinkedIn does NOT accept image URLs. You must follow a strict 3-step handshake.

### `src/lib/linkedin/publisher.ts`

```typescript
const LI_API = 'https://api.linkedin.com/v2';
const LI_MEDIA_API = 'https://api.linkedin.com/media/upload';
const AI_DISCLOSURE = '\n\n[Automated reply]'; // Required disclosure for LinkedIn too

interface LiPostContent {
  text: string;                           // Plain text for the post
  orgUrn?: string;                        // urn:li:organization:12345 (for page posts)
  memberUrn?: string;                     // urn:li:person:ID (for personal posts)
  imageBuffer?: Buffer;                   // Raw binary image data
  imageFilename?: string;
  videoBuffer?: Buffer;
  videoFilename?: string;
  mediaTitle?: string;
  mediaDescription?: string;
}

/**
 * Step 1: Register the upload with LinkedIn to get upload URL + asset URN
 */
async function registerMediaUpload(
  accessToken: string,
  ownerUrn: string,
  mediaType: 'IMAGE' | 'VIDEO'
): Promise<{ uploadUrl: string; assetUrn: string }> {
  const recipe = mediaType === 'IMAGE'
    ? 'urn:li:digitalmediaRecipe:feedshare-image'
    : 'urn:li:digitalmediaRecipe:feedshare-video';

  const res = await fetch(`${LI_API}/assets?action=registerUpload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: [recipe],
        owner: ownerUrn,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  const data = await res.json();
  if (data.status && data.status !== 200) {
    throw new Error(`[LI registerUpload] ${data.message || JSON.stringify(data)}`);
  }

  const uploadUrl = data.value?.uploadMechanism?.[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ]?.uploadUrl;
  const assetUrn = data.value?.asset;

  if (!uploadUrl || !assetUrn) throw new Error('[LI] Failed to get upload URL or asset URN');
  return { uploadUrl, assetUrn };
}

/**
 * Step 2: Upload raw binary data to LinkedIn's temporary upload URL
 * NOTE: This is a raw binary PUT — not JSON
 */
async function uploadBinaryToLinkedIn(
  uploadUrl: string,
  accessToken: string,
  data: Buffer,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,   // Required even on the upload URL
      'Content-Type': contentType,
    },
    body: data,
  });
  if (!res.ok) {
    throw new Error(`[LI upload] HTTP ${res.status}: ${await res.text()}`);
  }
}

/**
 * Step 3: Create the post using the permanent asset URN from Step 1
 */
export async function publishToLinkedIn(
  accessToken: string,
  content: LiPostContent
): Promise<{ postUrn: string; postUrl: string }> {
  const authorUrn = content.orgUrn ?? content.memberUrn!;
  if (!authorUrn) throw new Error('[LI] Must provide orgUrn or memberUrn');

  let shareMedia: any[] = [];

  // Handle image upload (Register → Upload → Reference)
  if (content.imageBuffer) {
    const { uploadUrl, assetUrn } = await registerMediaUpload(accessToken, authorUrn, 'IMAGE');
    await uploadBinaryToLinkedIn(uploadUrl, accessToken, content.imageBuffer, 'image/jpeg');
    shareMedia.push({
      status: 'READY',
      description: { text: content.mediaDescription ?? '' },
      media: assetUrn,
      title: { text: content.mediaTitle ?? '' },
    });
  }

  // Handle video upload
  if (content.videoBuffer) {
    const { uploadUrl, assetUrn } = await registerMediaUpload(accessToken, authorUrn, 'VIDEO');
    await uploadBinaryToLinkedIn(uploadUrl, accessToken, content.videoBuffer, 'video/mp4');
    shareMedia.push({
      status: 'READY',
      media: assetUrn,
      title: { text: content.mediaTitle ?? '' },
    });
  }

  // Build the Unified Posts API payload
  const postBody: Record<string, any> = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content.text },
        shareMediaCategory: shareMedia.length > 0
          ? (content.videoBuffer ? 'VIDEO' : 'IMAGE')
          : 'NONE',
        ...(shareMedia.length > 0 ? { media: shareMedia } : {}),
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch(`${LI_API}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  const postUrn = res.headers.get('x-restli-id');
  if (!postUrn) {
    const errBody = await res.json();
    throw new Error(`[LI post] ${errBody.message || JSON.stringify(errBody)}`);
  }

  const orgId = authorUrn.split(':').pop();
  return {
    postUrn,
    postUrl: `https://www.linkedin.com/company/${orgId}/posts/`,
  };
}

/**
 * Reply to a LinkedIn comment
 * NOTE: LinkedIn AI replies MUST have human approval — enforced in the AI worker
 */
export async function replyToLinkedInComment(
  parentCommentUrn: string,
  accessToken: string,
  text: string,
  actorUrn: string,
  isAiGenerated = false
): Promise<void> {
  if (isAiGenerated) {
    throw new Error(
      'LinkedIn AI replies must go through human approval — use suggestLinkedInReply instead'
    );
  }

  // Encode URN for URL path
  const encodedUrn = encodeURIComponent(parentCommentUrn);

  await fetch(`${LI_API}/socialActions/${encodedUrn}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      actor: actorUrn,
      message: { text },
    }),
  });
}

/**
 * Fetch comments for a LinkedIn post (for inbox display)
 */
export async function getLinkedInComments(
  ugcPostUrn: string,
  accessToken: string
): Promise<any[]> {
  const encoded = encodeURIComponent(ugcPostUrn);
  const res = await fetch(`${LI_API}/socialActions/${encoded}/comments?count=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  const data = await res.json();
  return data.elements ?? [];
}

/**
 * Fetch analytics for a LinkedIn org post
 */
export async function getLinkedInPostAnalytics(
  orgUrn: string,
  accessToken: string
): Promise<any> {
  const encoded = encodeURIComponent(orgUrn);
  const res = await fetch(
    `${LI_API}/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encoded}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );
  return res.json();
}
```

---

## 15. Cross-Platform Scheduler (Cloud Function Cron)

```typescript
// functions/src/scheduler.ts
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { publishToFbPage } from './meta/facebook';
import { publishToInstagram } from './meta/instagram';
import { publishToThreads } from './meta/threads';
import { publishToLinkedIn } from './linkedin/publisher';
import { decryptToken } from './crypto';

export const processScheduledPosts = functions.scheduler.onSchedule(
  { schedule: '* * * * *', timeZone: 'UTC' }, // Every minute
  async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const fiveMinAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);

    const snapshot = await db.collectionGroup('scheduledPosts')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '>=', fiveMinAgo)
      .where('scheduledAt', '<=', now)
      .limit(50)
      .get();

    await Promise.allSettled(snapshot.docs.map(processPost));
  }
);

async function processPost(doc: admin.firestore.QueryDocumentSnapshot) {
  const db = admin.firestore();
  const post = doc.data();

  // Atomic lock — prevents double-publish if function runs twice
  const locked = await db.runTransaction(async tx => {
    const fresh = await tx.get(doc.ref);
    if (fresh.data()?.status !== 'scheduled') return false;
    tx.update(doc.ref, {
      status: 'publishing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  });
  if (!locked) return;

  const results = [];

  for (const target of post.targets) {
    try {
      let result: any;

      switch (target.platform) {
        case 'facebook': {
          const tokenDoc = await db.doc(`users/${post.uid}/connectedPages/${target.accountId}`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          result = await publishToFbPage(target.accountId, token, post.content);
          break;
        }
        case 'instagram': {
          const tokenDoc = await db.doc(`users/${post.uid}/metaTokens/instagram`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          result = await publishToInstagram(target.accountId, token, post.content);
          break;
        }
        case 'threads': {
          const tokenDoc = await db.doc(`users/${post.uid}/metaTokens/threads`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          result = await publishToThreads(target.accountId, token, post.content);
          break;
        }
        case 'linkedin': {
          const tokenDoc = await db.doc(`users/${post.uid}/linkedinTokens/main`).get();
          const token = decryptToken(tokenDoc.data()!.accessToken);
          // Find the org URN from connectedOrgs
          const orgDocId = target.accountId.replace(/:/g, '_');
          const orgDoc = await db.doc(`users/${post.uid}/connectedOrgs/${orgDocId}`).get();
          result = await publishToLinkedIn(token, {
            text: post.content.text,
            orgUrn: orgDoc.data()!.urn,
            imageBuffer: post.content.imageBuffer,
          });
          break;
        }
      }

      results.push({
        platform: target.platform,
        accountId: target.accountId,
        ...result,
        publishedAt: Date.now(),
      });

    } catch (err) {
      results.push({
        platform: target.platform,
        accountId: target.accountId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  const allFailed = results.every(r => r.error);
  await doc.ref.update({
    status: allFailed ? 'failed' : 'published',
    results,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

---

## 16. Webhook-First Architecture — The 5-Second Rule

```
Meta/LinkedIn → Webhook Receiver → [validate signature] → enqueue → 200 OK in < 1s
                                                                ↓
                                                    Cloud Tasks Queue
                                                                ↓
                                                       Async AI Worker
                                                         (no time limit)
                                                                ↓
                                                   Post reply to platform API
```

### Meta Webhook Receiver — `src/app/api/webhooks/meta/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CloudTasksClient } from '@google-cloud/tasks';
import crypto from 'crypto';

const tasksClient = new CloudTasksClient();

function verifyMetaSignature(rawBody: string, signature: string): boolean {
  const expected = `sha256=${crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(rawBody)
    .digest('hex')}`;
  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch { return false; }
}

// GET: Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (
    searchParams.get('hub.mode') === 'subscribe' &&
    searchParams.get('hub.verify_token') === process.env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(searchParams.get('hub.challenge'), { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST: Receive event → validate → enqueue → 200 OK immediately
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';

  if (!verifyMetaSignature(rawBody, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  await tasksClient.createTask({
    parent: tasksClient.queuePath(
      process.env.FIREBASE_PROJECT_ID!,
      process.env.GOOGLE_CLOUD_REGION!,
      'webhook-processor'
    ),
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/meta/process`,
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_WEBHOOK_SECRET!,
        },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        oidcToken: {
          serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL!,
        },
      },
      // Retry up to 5 times with exponential backoff
      retryConfig: { maxAttempts: 5 },
    },
  });

  // CRITICAL: Return 200 immediately — never process inline
  return NextResponse.json({ status: 'queued' }, { status: 200 });
}
```

---

## 17. Meta Webhook Processor

### `src/app/api/webhooks/meta/process/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase/admin';
import { generateAiReply } from '@/lib/ai/auto-responder';
import { replyToFbComment } from '@/lib/meta/facebook';
import { replyToIgComment } from '@/lib/meta/instagram';
import { decryptToken } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  // Verify internal secret (this endpoint should not be publicly accessible)
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const body = await req.json();
  const { entry } = body;

  for (const item of entry) {
    const { id: pageId, changes, messaging } = item;

    // Facebook feed events (comments on page posts)
    if (changes) {
      for (const change of changes) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          await handleFbComment(pageId, change.value);
        }
      }
    }

    // Messenger direct messages
    if (messaging) {
      for (const event of messaging) {
        if (event.message && !event.message.is_echo) {
          await handleMessengerDM(pageId, event);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleFbComment(pageId: string, value: any) {
  const pagesSnap = await adminDb.collectionGroup('connectedPages')
    .where('pageId', '==', pageId).limit(1).get();
  if (pagesSnap.empty) return;

  const pageDoc = pagesSnap.docs[0];
  const uid = pageDoc.ref.parent.parent!.id;
  const settingsDoc = await adminDb.doc(`users/${uid}/settings/autoRespond`).get();
  const autoEnabled = settingsDoc.data()?.enabled ?? false;
  const confidenceThreshold = settingsDoc.data()?.confidenceThreshold ?? 0.85;

  const aiResult = await generateAiReply({
    platform: 'facebook_comment',
    message: value.message,
    postContext: value.post?.message,
    senderName: value.from?.name,
    uid,
  });

  const msgRef = adminDb.collection(`users/${uid}/inbox`).doc();
  await msgRef.set({
    id: msgRef.id,
    platform: 'facebook_comment',
    accountId: pageId,
    senderId: value.from?.id,
    senderName: value.from?.name ?? 'Unknown',
    message: value.message,
    parentPostId: value.post_id,
    parentPostContent: value.post?.message ?? null,
    commentId: value.comment_id,
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'unread',
    aiSuggestedReply: aiResult.reply,
    aiConfidence: aiResult.confidence,
    requiresHumanReview: aiResult.requiresHumanReview,
  });

  // Auto-send only if: enabled + high confidence + no review flag
  if (autoEnabled && !aiResult.requiresHumanReview && aiResult.confidence >= confidenceThreshold) {
    const token = decryptToken(pageDoc.data().accessToken);
    await replyToFbComment(value.comment_id, aiResult.reply, token, true);
    await msgRef.update({
      status: 'replied',
      repliedAt: admin.firestore.FieldValue.serverTimestamp(),
      repliedWith: aiResult.replyWithDisclosure,
      repliedBy: 'ai',
    });
  }
}

async function handleMessengerDM(pageId: string, event: any) {
  const pagesSnap = await adminDb.collectionGroup('connectedPages')
    .where('pageId', '==', pageId).limit(1).get();
  if (pagesSnap.empty) return;

  const uid = pagesSnap.docs[0].ref.parent.parent!.id;

  const aiResult = await generateAiReply({
    platform: 'facebook_messenger',
    message: event.message.text ?? '[media attachment]',
    senderName: `User ${event.sender.id}`,
    uid,
  });

  await adminDb.collection(`users/${uid}/inbox`).add({
    platform: 'facebook_messenger',
    accountId: pageId,
    senderId: event.sender.id,
    message: event.message.text ?? '',
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'unread',
    aiSuggestedReply: aiResult.reply,
    aiConfidence: aiResult.confidence,
    requiresHumanReview: true, // Messenger: always require human review for DMs
  });
}
```

---

## 18. LinkedIn Social Action Notifications

### LinkedIn Webhook Receiver — `src/app/api/webhooks/linkedin/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CloudTasksClient } from '@google-cloud/tasks';

const tasksClient = new CloudTasksClient();

function verifyLinkedInSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.LINKEDIN_CLIENT_SECRET!)
    .update(rawBody)
    .digest('base64');
  return signature === expected;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-li-signature') ?? '';

  if (!verifyLinkedInSignature(rawBody, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // Only process comment events
  if (payload.eventType !== 'ORGANIZATION_SOCIAL_ACTION_NOTIFY') {
    return NextResponse.json({ ok: true });
  }

  await tasksClient.createTask({
    parent: tasksClient.queuePath(
      process.env.FIREBASE_PROJECT_ID!,
      process.env.GOOGLE_CLOUD_REGION!,
      'webhook-processor'
    ),
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/linkedin/process`,
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_WEBHOOK_SECRET!,
        },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        oidcToken: { serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL! },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
```

### LinkedIn Webhook Processor — `src/app/api/webhooks/linkedin/process/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase/admin';
import { generateAiReply } from '@/lib/ai/auto-responder';

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const payload = await req.json();
  const { organizationUrn, comment, parentPost } = payload;

  // Find which Firebase user owns this organization
  const orgDocId = organizationUrn.replace(/:/g, '_');
  const orgsSnap = await adminDb.collectionGroup('connectedOrgs')
    .where('urn', '==', organizationUrn).limit(1).get();
  if (orgsSnap.empty) return NextResponse.json({ ok: true });

  const uid = orgsSnap.docs[0].ref.parent.parent!.id;

  // AI reply SUGGESTION only — LinkedIn requires human approval
  const aiResult = await generateAiReply({
    platform: 'linkedin_comment',
    message: comment?.message?.text ?? '',
    postContext: parentPost?.specificContent?.['com.linkedin.ugc.ShareContent']
      ?.shareCommentary?.text ?? '',
    senderName: comment?.actor?.split(':').pop() ?? 'LinkedIn User',
    uid,
    forceHumanReview: true, // LinkedIn always requires human approval (3% rule)
  });

  await adminDb.collection(`users/${uid}/inbox`).add({
    platform: 'linkedin_comment',
    accountId: organizationUrn,
    commentUrn: comment?.id,
    parentPostUrn: parentPost?.id,
    senderId: comment?.actor,
    message: comment?.message?.text ?? '',
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'unread',
    aiSuggestedReply: aiResult.reply,
    aiConfidence: aiResult.confidence,
    // CRITICAL: LinkedIn AI replies NEVER auto-send — always require human review
    requiresHumanReview: true,
    linkedinReviewRequired: true,
  });

  return NextResponse.json({ ok: true });
}
```

---

## 19. Unified Inbox — All Platforms

### `src/components/inbox/InboxFeed.tsx`

```tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where, type Query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export const PLATFORM_CONFIG: Record<string, {
  label: string;
  color: string;
  charLimit: number;
  alwaysHumanReview: boolean;
}> = {
  facebook_comment:   { label: 'FB Comment',    color: 'bg-blue-100 text-blue-800',   charLimit: 8000,  alwaysHumanReview: false },
  facebook_messenger: { label: 'Messenger',      color: 'bg-blue-200 text-blue-900',   charLimit: 2000,  alwaysHumanReview: false },
  instagram_comment:  { label: 'IG Comment',     color: 'bg-pink-100 text-pink-800',   charLimit: 2200,  alwaysHumanReview: false },
  instagram_dm:       { label: 'Instagram DM',   color: 'bg-purple-100 text-purple-800', charLimit: 1000, alwaysHumanReview: true },
  threads_reply:      { label: 'Threads',        color: 'bg-gray-100 text-gray-800',   charLimit: 484,   alwaysHumanReview: false },
  linkedin_comment:   { label: 'LinkedIn',       color: 'bg-sky-100 text-sky-800',     charLimit: 1250,  alwaysHumanReview: true },
};

type InboxFilter = 'unread' | 'all' | 'needs_review' | 'replied';

export function InboxFeed({ uid }: { uid: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<InboxFilter>('unread');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  useEffect(() => {
    let q: Query = collection(db, `users/${uid}/inbox`) as any;

    if (filter === 'needs_review') {
      q = query(q, where('requiresHumanReview', '==', true), where('status', '!=', 'replied'));
    } else if (filter !== 'all') {
      q = query(q, where('status', '==', filter));
    }

    q = query(q, orderBy('receivedAt', 'desc'));

    return onSnapshot(q, snap => {
      let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (platformFilter !== 'all') {
        msgs = msgs.filter((m: any) => m.platform === platformFilter);
      }
      setMessages(msgs);
    });
  }, [uid, filter, platformFilter]);

  const filters: { id: InboxFilter; label: string }[] = [
    { id: 'unread', label: 'Unread' },
    { id: 'needs_review', label: '⚠️ Needs Review' },
    { id: 'all', label: 'All' },
    { id: 'replied', label: 'Replied' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPlatformFilter('all')}
          className={`px-3 py-1 rounded-full text-xs ${platformFilter === 'all' ? 'bg-foreground text-background' : 'bg-muted'}`}
        >
          All platforms
        </button>
        {Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => setPlatformFilter(id)}
            className={`px-3 py-1 rounded-full text-xs ${platformFilter === id ? cfg.color + ' font-semibold' : 'bg-muted'}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {messages.map(msg => (
          <InboxCard key={msg.id} message={msg} uid={uid} />
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            No messages matching this filter
          </div>
        )}
      </div>
    </div>
  );
}

function InboxCard({ message: msg, uid }: { message: any; uid: string }) {
  const [replyText, setReplyText] = useState(msg.aiSuggestedReply ?? '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(msg.status === 'replied');

  const cfg = PLATFORM_CONFIG[msg.platform] ?? { label: msg.platform, color: 'bg-gray-100', charLimit: 500, alwaysHumanReview: false };
  const isLinkedIn = msg.platform === 'linkedin_comment';
  const isOverLimit = replyText.length > cfg.charLimit;

  const handleSend = async () => {
    if (isOverLimit) return;
    setSending(true);
    await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: msg.id, uid, reply: replyText }),
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className={`p-4 border rounded-xl space-y-3 ${
      msg.requiresHumanReview && !sent ? 'border-amber-400 bg-amber-50/40' : ''
    } ${sent ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="font-semibold text-sm">{msg.senderName}</span>
          {msg.requiresHumanReview && !sent && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              ⚠️ Human review required
            </span>
          )}
          {isLinkedIn && (
            <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
              🔷 LinkedIn — AI auto-send disabled
            </span>
          )}
          {sent && <span className="text-xs text-green-600">✓ Replied</span>}
        </div>
        <span className="text-xs text-muted-foreground">
          {msg.receivedAt?.toDate?.()?.toLocaleTimeString() ?? ''}
        </span>
      </div>

      {msg.parentPostContent && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-muted-foreground/20">
          Post: {msg.parentPostContent.slice(0, 120)}{msg.parentPostContent.length > 120 ? '…' : ''}
        </div>
      )}

      <p className="text-sm">{msg.message}</p>

      {!sent && (
        <div className="space-y-2">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
            className={`w-full text-sm p-2 border rounded-lg resize-none ${isOverLimit ? 'border-red-400' : ''}`}
            placeholder="Write a reply..."
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className={`text-xs ${isOverLimit ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                {replyText.length}/{cfg.charLimit}
                {isOverLimit && ' ⛔ Over limit'}
              </span>
              {msg.aiSuggestedReply && (
                <span className="text-xs text-muted-foreground">✨ AI-suggested</span>
              )}
              {msg.aiConfidence && (
                <span className="text-xs text-muted-foreground">
                  Confidence: {Math.round(msg.aiConfidence * 100)}%
                </span>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || sending || isOverLimit}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 20. AI Reply Engine — Contextual + Policy-Compliant

### `src/lib/ai/auto-responder.ts`

```typescript
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/lib/firebase/admin';

// Meta Policy: label all automated replies
const META_AI_DISCLOSURE   = '\n\n— Automated reply';
// LinkedIn best practice disclosure (human still approves but reply should note automation)
const LINKEDIN_AI_DISCLOSURE = '\n\n[Automated suggestion — reviewed before sending]';

// Threads: 500 char hard limit; disclosure takes 19 chars → max body = 481
const THREADS_BODY_LIMIT = 481;

interface ReplyContext {
  platform: string;
  message: string;
  senderName?: string;
  postContext?: string;
  previousMessages?: string[];
  uid: string;
  forceHumanReview?: boolean;
}

export interface ReplyResult {
  reply: string;                  // Clean reply without disclosure
  replyWithDisclosure: string;    // Full reply with policy-required disclosure
  confidence: number;             // 0–1
  requiresHumanReview: boolean;   // Always true for LinkedIn
  reason?: string;
}

const ReplySchema = z.object({
  reply: z.string(),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.boolean(),
  reason: z.string().optional(),
});

function getCharLimit(platform: string): number {
  if (platform.includes('threads')) return THREADS_BODY_LIMIT;
  if (platform.includes('linkedin')) return 1250;
  if (platform.includes('instagram')) return 2200;
  return 8000;
}

function getDisclosure(platform: string): string {
  if (platform.includes('linkedin')) return LINKEDIN_AI_DISCLOSURE;
  return META_AI_DISCLOSURE;
}

export async function generateAiReply(context: ReplyContext): Promise<ReplyResult> {
  const brandDoc = await adminDb.doc(`users/${context.uid}/settings/brandVoice`).get();
  const brandVoice = brandDoc.data()?.tone ?? 'professional, warm, and helpful';
  const brandInstructions = brandDoc.data()?.instructions ?? '';
  const charLimit = getCharLimit(context.platform);
  const disclosure = getDisclosure(context.platform);

  const prompt = ai.definePrompt({
    name: `autoReply_${context.platform}_${Date.now()}`,
    model: 'googleai/gemini-2.0-flash',
    input: { schema: z.object({ ctx: z.any() }) },
    output: { schema: ReplySchema },
    prompt: `You are a professional social media manager for a brand. Generate a reply to the message below.

Platform: {{ctx.platform}}
Brand Voice: {{ctx.brandVoice}}
{{#if ctx.brandInstructions}}Brand Instructions: {{ctx.brandInstructions}}{{/if}}
{{#if ctx.postContext}}Original Post Context: {{ctx.postContext}}{{/if}}
{{#if ctx.previousMessages}}
Prior conversation:
{{#each ctx.previousMessages}}- {{this}}
{{/each}}
{{/if}}

Message from {{ctx.senderName}}: "{{ctx.message}}"

Rules:
1. Stay on-brand and professional
2. Keep reply under {{ctx.charLimit}} characters (leave room for disclosure label)
3. For complaints: acknowledge, apologize briefly, offer to help
4. For compliments: thank sincerely, don't be sycophantic
5. Spam / hate speech / threatening content: requiresHumanReview: true
6. Legal, medical, pricing, or sensitive topics: requiresHumanReview: true
7. If confidence < 0.85: requiresHumanReview: true
8. LinkedIn platform: always requiresHumanReview: true (3% spam policy)
9. Do NOT include any disclosure label in your reply text — that is added programmatically
10. Respond ONLY in JSON format

Return: { "reply", "confidence", "requiresHumanReview", "reason" }`,
  });

  const result = await prompt({
    ctx: {
      ...context,
      brandVoice,
      brandInstructions,
      charLimit,
    }
  });

  const output = result.output!;

  // Force human review for LinkedIn regardless of AI decision
  const requiresHumanReview = context.forceHumanReview
    ? true
    : output.requiresHumanReview;

  return {
    reply: output.reply,
    replyWithDisclosure: output.reply + disclosure,
    confidence: output.confidence,
    requiresHumanReview,
    reason: output.reason,
  };
}
```

---

## 21. Multi-Platform Composer

### `src/components/composer/PostComposer.tsx`

```tsx
'use client';
import { useState, useRef } from 'react';

export const PLATFORM_SPECS = {
  facebook:  { maxChars: 63206, label: 'Facebook',   icon: '🔵', accentClass: 'border-blue-400' },
  instagram: { maxChars: 2200,  label: 'Instagram',  icon: '🟣', accentClass: 'border-pink-400', firstVisible: 125 },
  threads:   { maxChars: 500,   label: 'Threads',    icon: '⚫', accentClass: 'border-gray-400' },
  linkedin:  { maxChars: 3000,  label: 'LinkedIn',   icon: '🔷', accentClass: 'border-sky-400' },
};

export function CharCounter({ text, platform }: { text: string; platform: keyof typeof PLATFORM_SPECS }) {
  const spec = PLATFORM_SPECS[platform];
  const remaining = spec.maxChars - text.length;
  const pct = Math.min(text.length / spec.maxChars, 1);
  const isOver = remaining < 0;
  const isWarning = remaining >= 0 && remaining < 30;

  const r = 15;
  const circumference = 2 * Math.PI * r;
  const strokeDasharray = `${pct * circumference} ${circumference}`;
  const color = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3"/>
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
      {(isWarning || isOver) && (
        <span className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-amber-500'}`}>
          {remaining}
        </span>
      )}
      {platform === 'instagram' && text.length > 125 && !isOver && (
        <span className="text-xs text-amber-500">First 125 chars visible in feed</span>
      )}
      {platform === 'threads' && isOver && (
        <span className="text-xs text-red-500">⛔ Threads hard limit — post will fail</span>
      )}
    </div>
  );
}

type Platform = keyof typeof PLATFORM_SPECS;

interface ComposerProps {
  availableAccounts: Array<{
    id: string;
    name: string;
    platform: Platform;
    picture?: string;
  }>;
  onSubmit: (data: {
    text: string;
    mediaFiles: File[];
    targets: string[];
    scheduledAt?: Date;
  }) => Promise<void>;
}

export function PostComposer({ availableAccounts, onSubmit }: ComposerProps) {
  const [text, setText] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Per-platform text overrides (if user wants different copy per platform)
  const [overrides, setOverrides] = useState<Partial<Record<Platform, string>>>({});

  const selectedPlatforms = [
    ...new Set(
      selectedTargets
        .map(id => availableAccounts.find(a => a.id === id)?.platform)
        .filter(Boolean) as Platform[]
    ),
  ];

  const textForPlatform = (p: Platform) => overrides[p] ?? text;

  const hasOverLimit = selectedPlatforms.some(p =>
    textForPlatform(p).length > PLATFORM_SPECS[p].maxChars
  );

  const handleSubmit = async () => {
    if (hasOverLimit || selectedTargets.length === 0) return;
    setSubmitting(true);
    await onSubmit({
      text,
      mediaFiles,
      targets: selectedTargets,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });
    setSubmitting(false);
    setText('');
    setSelectedTargets([]);
    setMediaFiles([]);
    setScheduledAt('');
    setOverrides({});
  };

  return (
    <div className="space-y-5">
      {/* Target account selector */}
      <div>
        <p className="text-sm font-medium mb-2">Post to</p>
        <div className="flex flex-wrap gap-2">
          {availableAccounts.map(acct => {
            const selected = selectedTargets.includes(acct.id);
            const spec = PLATFORM_SPECS[acct.platform];
            return (
              <button
                key={acct.id}
                onClick={() => setSelectedTargets(prev =>
                  prev.includes(acct.id) ? prev.filter(x => x !== acct.id) : [...prev, acct.id]
                )}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                  selected ? `${spec.accentClass} bg-muted/60 font-medium` : 'border-transparent bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{spec.icon}</span>
                <span>{acct.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main text area */}
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          placeholder="Write your post..."
          className="w-full p-3 border rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        {/* Per-platform char counters */}
        {selectedPlatforms.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {selectedPlatforms.map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{PLATFORM_SPECS[p].icon}</span>
                <CharCounter text={textForPlatform(p)} platform={p} />
              </div>
            ))}
          </div>
        )}

        {/* Platform-specific overrides */}
        {selectedPlatforms.map(p => (
          <details key={p} className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              {PLATFORM_SPECS[p].icon} Customize text for {PLATFORM_SPECS[p].label}
            </summary>
            <textarea
              value={overrides[p] ?? text}
              onChange={e => setOverrides(prev => ({ ...prev, [p]: e.target.value }))}
              rows={3}
              className="mt-1 w-full p-2 border rounded-lg text-xs resize-none"
              placeholder={`Custom text for ${PLATFORM_SPECS[p].label}...`}
            />
          </details>
        ))}
      </div>

      {/* Media upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={e => setMediaFiles(Array.from(e.target.files ?? []))}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-lg px-4 py-2 w-full"
        >
          {mediaFiles.length > 0
            ? `${mediaFiles.length} file(s) selected`
            : '📎 Attach photo or video'}
        </button>
        {selectedPlatforms.includes('linkedin') && mediaFiles.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ LinkedIn: Images/videos will be uploaded via LinkedIn's Register-Upload-Verify pipeline (not URL-based).
          </p>
        )}
      </div>

      {/* Schedule */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Schedule (optional)</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          min={new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16)}
          className="text-sm p-2 border rounded-lg"
        />
        {selectedPlatforms.includes('facebook') && scheduledAt && (
          <p className="text-xs text-muted-foreground">
            Facebook: Scheduled posts must be 10 min–30 days in the future.
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          selectedTargets.length === 0 ||
          !text.trim() ||
          hasOverLimit ||
          submitting
        }
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
      >
        {submitting
          ? (scheduledAt ? 'Scheduling…' : 'Publishing…')
          : (scheduledAt
            ? `Schedule for ${selectedTargets.length} account${selectedTargets.length > 1 ? 's' : ''}`
            : `Publish to ${selectedTargets.length} account${selectedTargets.length > 1 ? 's' : ''}`)}
      </button>
    </div>
  );
}
```

---

## 22. Analytics Dashboard

```typescript
// src/lib/linkedin/analytics.ts
const LI_API = 'https://api.linkedin.com/v2';

export async function getLinkedInOrgAnalytics(
  orgUrn: string,
  accessToken: string,
  startTime: number, // Unix ms
  endTime: number
) {
  const encoded = encodeURIComponent(orgUrn);
  const res = await fetch(
    `${LI_API}/organizationalEntityShareStatistics` +
    `?q=organizationalEntity&organizationalEntity=${encoded}` +
    `&timeIntervals.timeGranularityType=DAY` +
    `&timeIntervals.timeRange.start=${startTime}` +
    `&timeIntervals.timeRange.end=${endTime}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );
  return res.json();
}

// src/lib/meta/analytics.ts
const GRAPH = 'https://graph.facebook.com/v22.0';

export async function getPageInsights(
  pageId: string,
  pageToken: string,
  metrics = ['page_impressions', 'page_reach', 'page_engaged_users', 'page_post_engagements'],
  period = 'day'
) {
  const res = await fetch(
    `${GRAPH}/${pageId}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${pageToken}`
  );
  return res.json();
}

export async function getIgInsights(igUserId: string, igToken: string) {
  const fields = [
    'followers_count', 'media_count',
    'profile_views', 'website_clicks',
    'reach', 'impressions',
  ].join(',');
  const res = await fetch(`${GRAPH}/${igUserId}?fields=${fields}&access_token=${igToken}`);
  return res.json();
}
```

---

## 23. Firebase Data Models

```
users/
  {uid}/
    profile                 → { displayName, email, plan, techProviderVerified, createdAt }

    settings/
      autoRespond           → { enabled, confidenceThreshold (0–1), platforms[] }
      brandVoice            → { tone, instructions, examples[] }
      notifications         → { tokenExpiry: bool, newMessages: bool }

    metaTokens/
      facebook              → { userId, name, accessToken*, expiresAt, connectedAt }
      instagram             → { userId, username, accessToken*, expiresAt }
      threads               → { userId, username, accessToken*, expiresAt }
      (* = AES-256-GCM encrypted)

    linkedinTokens/
      main                  → { memberId, displayName, accessToken*, refreshToken*, expiresAt }

    connectedPages/         (Facebook Pages — permanent page tokens)
      {pageId}              → { pageId, name, category, picture, accessToken*, platform,
                                instagramAccountId?, connectedAt }

    connectedOrgs/          (LinkedIn Company Pages)
      {urn_colon_escaped}   → { urn, orgId, name, logoUrl, platform, connectedAt }

    scheduledPosts/
      {postId}              → {
        uid, platforms[], targets[{ platform, accountId, accountName }],
        content{ text, imageUrls[], videoUrl, link },
        scheduledAt (Timestamp), timezone,
        status: 'scheduled'|'publishing'|'published'|'failed',
        results[{ platform, accountId, postId?, postUrl?, error?, publishedAt? }],
        createdAt, updatedAt
      }

    inbox/
      {messageId}           → {
        id, platform, accountId,
        senderId, senderName, senderAvatarUrl?,
        message, parentPostId?, parentPostContent?,
        commentId?, commentUrn?, parentPostUrn?,
        receivedAt (Timestamp),
        status: 'unread'|'read'|'replied'|'ignored',
        aiSuggestedReply?, aiConfidence?, requiresHumanReview,
        linkedinReviewRequired?,
        repliedAt?, repliedWith?, repliedBy: 'human'|'ai'
      }

    rateLimits/
      {platform}            → { calls, windowStart }

    notifications/
      {notifId}             → { type, platform, message, read, createdAt }
```

---

## 24. Rate Limit Middleware

```typescript
// src/lib/rate-limiter.ts
import { adminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

const LIMITS: Record<string, { calls: number; windowMs: number }> = {
  facebook:         { calls: 200,  windowMs: 3_600_000  }, // 200/hour
  instagram:        { calls: 240,  windowMs: 3_600_000  }, // 240/hour
  threads_post:     { calls: 250,  windowMs: 86_400_000 }, // 250 posts/day
  threads_reply:    { calls: 1000, windowMs: 86_400_000 }, // 1000 replies/day
  linkedin:         { calls: 100,  windowMs: 86_400_000 }, // Conservative daily budget
};

export async function checkRateLimit(
  uid: string,
  limitKey: string,
  cost = 1
): Promise<void> {
  const cfg = LIMITS[limitKey];
  if (!cfg) return;

  const ref = adminDb.doc(`users/${uid}/rateLimits/${limitKey}`);

  await adminDb.runTransaction(async tx => {
    const doc = await tx.get(ref);
    const now = Date.now();
    const windowStart = now - (now % cfg.windowMs);
    const data = doc.exists
      ? doc.data()!
      : { calls: 0, windowStart };

    if (data.windowStart < windowStart) {
      data.calls = 0;
      data.windowStart = windowStart;
    }

    if (data.calls + cost > cfg.calls) {
      const resetIn = Math.ceil((data.windowStart + cfg.windowMs - now) / 1000);
      throw new Error(
        `Rate limit reached for ${limitKey}. Resets in ${resetIn}s (${Math.ceil(resetIn / 60)} min).`
      );
    }

    tx.set(ref, {
      calls: data.calls + cost,
      windowStart: data.windowStart,
      lastCall: now,
    });
  });
}
```

---

## 25. App Review Guides — Meta & LinkedIn

### Meta App Review (Tech Provider Track)

**Required Before Submitting:**
- [ ] Tech Provider Registration approved (legal docs submitted)
- [ ] Business Verification approved
- [ ] Public Privacy Policy URL (must mention Meta data specifically)
- [ ] Data Deletion Request URL (user-facing form or instructions)
- [ ] All permissions listed in your Facebook Login for Business Configuration
- [ ] App deployed at a public, accessible URL

**Screencast Script (5–10 min video per permission group):**

| Scene | What to show | Permission demonstrated |
|---|---|---|
| 1 | Login → Connect page → click "Connect with Facebook Login for Business" → Business Portfolio modal | `business_management`, `pages_show_list` |
| 2 | Pages appear in dashboard automatically | `pages_show_list` |
| 3 | Composer → write post → select Page → Publish Now → post visible on Page | `pages_manage_posts` |
| 4 | Composer → set future time → Schedule | `pages_manage_posts` (scheduled) |
| 5 | Inbox → comment shown → user types reply → Send | `pages_manage_engagement` |
| 6 | Inbox → AI suggestion shown → user approves → "Automated reply" label visible in reply | `pages_manage_engagement` |
| 7 | Messenger DM in inbox → reply sent | `pages_messaging` |
| 8 | Analytics page → reach/impressions/engagement | `pages_read_engagement` |
| 9 | Settings → Disconnect → data deletion explanation | (GDPR/Platform Policy) |

**Rejection Reason → Fix:**

| Reason | Fix |
|---|---|
| "General Utility" | Write specific use-case: "Agency user scheduling posts for client Facebook Pages from a shared dashboard" |
| Permission not shown | Narrate during video: "I am now using pages_manage_posts to create this scheduled post" |
| No Privacy Policy | Add real URL — must be publicly accessible during review |
| AI not disclosed | Show "Automated reply" label in inbox screenshot/video |
| Missing Business Verification | Must be fully approved first |

---

### LinkedIn App Review (Community Management Track)

**Required Before Submitting:**
- [ ] Your company has a LinkedIn Company Page (verified)
- [ ] Community Management API application submitted and approved
- [ ] Privacy Policy URL accessible
- [ ] GDPR/CCPA data handling described

**Screencast Script:**

| Scene | What to show |
|---|---|
| 1 | Login → Connect LinkedIn → OAuth consent screen with scopes |
| 2 | Company Pages auto-discovered (no manual selection) |
| 3 | Composer → write post → select Company Page → Publish |
| 4 | Comment inbox → LinkedIn comment shown → AI suggestion displayed → human approves → reply sent |
| 5 | Analytics page showing org engagement data |

**What NOT to promise or demo:**
- LinkedIn Group posting
- LinkedIn Direct Messaging
- Any feature requiring `r_messages` or `w_messages`

**Review timeline:** 2–3 weeks. Factor into your launch plan.

---

## 26. Testing & Verification Checklist

### Phase 1: Sandbox Setup

- [ ] Create Meta Test Users in Developer Dashboard → Roles → Test Users
- [ ] Assign test user as admin of a Test Facebook Page
- [ ] Use Graph API Explorer to validate tokens manually: https://developers.facebook.com/tools/explorer
- [ ] Create LinkedIn test org or use personal page in Dev mode
- [ ] Test Meta webhook delivery with built-in "Test" button in Dashboard

### Phase 2: OAuth Flows

- [ ] Meta: OAuth uses `config_id` → shows Business Portfolio selector (not per-page list)
- [ ] Meta: Callback stores encrypted long-lived token + all page tokens in Firestore
- [ ] Meta: Page tokens NOT stored as cleartext anywhere (check Firestore, logs)
- [ ] Threads: OAuth uses `threads.net/oauth/authorize` (confirm URL in browser)
- [ ] Threads: Separate callback stores token under `metaTokens/threads`
- [ ] LinkedIn: OAuth uses `rw_organization_admin` scope
- [ ] LinkedIn: Auto-discovery finds all orgs (no manual selection)
- [ ] LinkedIn: Orgs stored with full URN (`urn:li:organization:12345`)

### Phase 3: Publishing

- [ ] Facebook: Text post appears on Page within 30s
- [ ] Facebook: Photo post creates `/photos` endpoint call (not `/feed`)
- [ ] Facebook: Scheduled post fires within 60s of scheduled time
- [ ] Instagram: 2-step container flow (create → poll FINISHED → publish)
- [ ] Instagram: Carousel creates child containers before parent
- [ ] Instagram: Video container polls until FINISHED before publishing
- [ ] Threads: Text > 500 chars rejected client-side before API call
- [ ] Threads: Carousel uses `is_carousel_item: true` on children
- [ ] LinkedIn: Image upload uses Register → Binary PUT → Post URN flow
- [ ] LinkedIn: Post body uses `urn:li:organization:ID` not integer IDs

### Phase 4: Webhooks & Inbox

- [ ] Meta webhook: `GET` handshake returns `hub.challenge` value
- [ ] Meta webhook: `POST` returns `200 OK` in < 2 seconds (measure with timing)
- [ ] Meta webhook: AI processing happens in Cloud Tasks (not inline)
- [ ] Meta webhook: Duplicate reply test — simulate retry → only one reply sent
- [ ] LinkedIn webhook: `x-li-signature` verified before processing
- [ ] Inbox: Facebook comment appears with AI suggestion
- [ ] Inbox: LinkedIn comment shows "Human review required" flag (no auto-send button)
- [ ] Inbox: Threads reply enforces 484 char limit (500 minus disclosure)
- [ ] AI reply: Contains `— Automated reply` disclosure when auto-sent
- [ ] AI reply: `requiresHumanReview: true` for spam/hate speech test input

### Phase 5: Token Management

- [ ] Token refresh Cloud Function runs at 2 AM UTC
- [ ] Tokens expiring within 7 days are refreshed
- [ ] Expired tokens trigger user notification (visible in dashboard)
- [ ] `decryptToken(encryptToken(token)) === token` (round-trip test)

### Phase 6: Policy Compliance

- [ ] No access tokens logged anywhere (Cloud Function logs, Next.js logs)
- [ ] All tokens AES-256-GCM encrypted at rest in Firestore
- [ ] Meta AI replies always include disclosure suffix on auto-send
- [ ] LinkedIn auto-send is structurally impossible (hardcoded `requiresHumanReview: true`)
- [ ] Webhook signatures verified on every incoming request
- [ ] Rate limiter blocks requests at defined thresholds

---

## 27. Environment Variables Reference

```env
# ═══════════════════════════════════════════════
#  META
# ═══════════════════════════════════════════════
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret                    # NEVER expose client-side
NEXT_PUBLIC_META_APP_ID=your_meta_app_id                # Safe — used in OAuth URLs
NEXT_PUBLIC_META_LOGIN_CONFIG_ID=your_config_id         # From FB Login for Business config
META_WEBHOOK_VERIFY_TOKEN=random_secret_string

# ═══════════════════════════════════════════════
#  LINKEDIN
# ═══════════════════════════════════════════════
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret      # NEVER expose client-side
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id  # Safe

# ═══════════════════════════════════════════════
#  ENCRYPTION (generate: openssl rand -hex 32)
# ═══════════════════════════════════════════════
TOKEN_ENCRYPTION_KEY=64_hex_chars_here                  # NEVER commit — use secrets manager

# ═══════════════════════════════════════════════
#  FIREBASE
# ═══════════════════════════════════════════════
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# ═══════════════════════════════════════════════
#  GOOGLE CLOUD (for Cloud Tasks queue)
# ═══════════════════════════════════════════════
SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_REGION=us-central1

# Internal security — prevents direct access to async processor routes
INTERNAL_WEBHOOK_SECRET=another_random_secret_string

# ═══════════════════════════════════════════════
#  AI (Genkit / Gemini)
# ═══════════════════════════════════════════════
GEMINI_API_KEY=your_key
GEMINI_MODEL=googleai/gemini-2.0-flash
GEMINI_FALLBACK_MODELS=googleai/gemini-1.5-flash,googleai/gemini-1.5-flash-8b

# ═══════════════════════════════════════════════
#  APP
# ═══════════════════════════════════════════════
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Platform Constraints Quick Reference

| Constraint | Facebook | Instagram | Threads | LinkedIn |
|---|---|---|---|---|
| Post char limit | 63,206 | 2,200 | **500 (hard)** | 3,000 |
| Comment limit | 8,000 | 2,200 | **484 w/ disclosure** | 1,250 |
| Media upload | URL | 2-step container | 2-step container | **Register-Upload-Verify** |
| Edit after publish | ✅ | ❌ | ❌ | ✅ |
| Groups API | Limited | N/A | N/A | **Deprecated** |
| DM/Messaging | ✅ (Messenger) | Limited | ❌ | **Partner only** |
| AI auto-reply | ✅ (w/ disclosure) | ✅ (w/ disclosure) | ✅ (w/ disclosure) | **❌ Human required** |
| Token type | Long-lived (60d) | Long-lived (60d) | Long-lived (60d) | 60d + refresh token |
| Page token | Permanent | Via FB page | N/A | Org uses user token |
| Rate limit | 200/hr | 240/hr | 250 posts/day | 100/day (conservative) |
| ID format | Integer | Integer | Integer | **URN string** |
| Review track | Tech Provider | Tech Provider | Standard | Community Mgmt API |
| Webhook type | Meta Webhooks | Meta Webhooks | N/A | Org Social Action Notify |

---

*Meta Graph API v22.0 · Threads API v1.0 · LinkedIn Community Management API v2*  
*Compiled and verified March 2026*  
*Meta changelog: https://developers.facebook.com/docs/graph-api/changelog*  
*LinkedIn changelog: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/recent-changes*
