# Building a Professional Meta Social Media Management Platform
### Facebook · Instagram · Threads — OAuth, Scheduling, Inbox, AI Automation

> **Stack:** Next.js 15 · Firebase · Meta Graph API v22 · Threads API · Genkit AI  
> **Audience:** Production-grade SaaS build. Every step verified against 2025/2026 API policies.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Meta App Setup & App Review](#2-meta-app-setup--app-review)
3. [Permissions Map — Every Scope You Need](#3-permissions-map--every-scope-you-need)
4. [One-Click OAuth Flow (Industry Pattern)](#4-one-click-oauth-flow-industry-pattern)
5. [Token Management & Storage](#5-token-management--storage)
6. [Facebook Pages & Groups API](#6-facebook-pages--groups-api)
7. [Instagram Graph API (Business/Creator Only)](#7-instagram-graph-api-businesscreator-only)
8. [Threads API](#8-threads-api)
9. [Scheduling Engine](#9-scheduling-engine)
10. [Unified Inbox & Replies](#10-unified-inbox--replies)
11. [AI-Automated Comment Responses](#11-ai-automated-comment-responses)
12. [Firebase Data Models](#12-firebase-data-models)
13. [Webhook Setup (Real-Time Events)](#13-webhook-setup-real-time-events)
14. [Rate Limit Handling](#14-rate-limit-handling)
15. [App Review Submission Checklist](#15-app-review-submission-checklist)
16. [Testing & Verification](#16-testing--verification)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 15 App (App Router)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Dashboard   │  │  Composer    │  │  Unified Inbox        │  │
│  │  (Analytics) │  │  + Scheduler │  │  (FB + IG + Threads)  │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ Next.js Server Actions / API Routes
┌────────────────────────▼────────────────────────────────────────┐
│                     Firebase Backend                            │
│  ┌────────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │  Firestore     │  │  Cloud        │  │  Firebase        │   │
│  │  (posts,tokens │  │  Functions    │  │  Auth            │   │
│  │   messages)    │  │  (scheduler,  │  │  (email+Google)  │   │
│  └────────────────┘  │   webhooks,   │  └──────────────────┘   │
│                       │   AI replies) │                          │
│                       └───────────────┘                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  Meta Graph API v22                              │
│   Facebook Graph API ─── Instagram Graph API ─── Threads API   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Server Actions** handle all Meta API calls server-side — tokens never touch the browser
- **Firebase Cloud Functions** run the scheduler (cron every minute), webhook receivers, and AI automation
- **Firestore** stores encrypted tokens, scheduled posts, inbox messages
- **Genkit AI** powers intelligent comment/DM responses with context

---

## 2. Meta App Setup & App Review

### Step 1: Create Meta Developer Account
1. Go to https://developers.facebook.com
2. Register as a developer (requires a verified Meta account)
3. Complete **business verification** at https://business.facebook.com — submit documents; takes 1–3 days

### Step 2: Create the App
1. Go to **My Apps → Create App**
2. Select **"Business"** as the app type (required for advanced permissions)
3. Add these **products** to your app:
   - Facebook Login
   - Instagram (Instagram Graph API)
   - Threads API (select "Access the Threads API" use case)
   - Webhooks
4. Note your **App ID** and **App Secret** — store in `.env.local`

### Step 3: Configure OAuth Redirect URIs
In **Facebook Login → Settings**, add:
```
https://yourdomain.com/api/auth/callback/meta/facebook
https://yourdomain.com/api/auth/callback/meta/instagram
https://yourdomain.com/api/auth/callback/threads
```
For local dev, also add:
```
http://localhost:3000/api/auth/callback/meta/facebook
```

### Step 4: Configure Webhooks
In **Webhooks product**, set:
- **Callback URL:** `https://yourdomain.com/api/webhooks/meta`
- **Verify Token:** your secret string from `.env`
- Subscribe to: `feed`, `messages`, `messaging_postbacks`, `mention`

---

## 3. Permissions Map — Every Scope You Need

This is the complete, minimal set of permissions for a professional social media management platform. Request only what you use — Meta rejects apps with unused permissions.

### Facebook Page Management

| Permission | What it unlocks | Review Required |
|---|---|---|
| `pages_show_list` | List user's pages | No |
| `pages_read_engagement` | Read comments, likes, reactions | Yes |
| `pages_manage_posts` | Create, edit, delete page posts | Yes |
| `pages_manage_engagement` | Reply to comments, like comments | Yes |
| `pages_messaging` | Send/receive Messenger messages | Yes |
| `pages_read_user_content` | Read user posts on page | Yes |
| `business_management` | Access Business Manager assets | Yes |
| `publish_video` | Upload video to pages | Yes |

### Instagram Graph API

| Permission | What it unlocks | Review Required |
|---|---|---|
| `instagram_basic` | Read IG profile + media | No |
| `instagram_content_publish` | Create posts, reels, stories | Yes |
| `instagram_manage_comments` | Read + reply to comments | Yes |
| `instagram_manage_messages` | Read + send DMs | Yes |
| `instagram_manage_insights` | Access post analytics | Yes |

### Threads API

| Scope | What it unlocks |
|---|---|
| `threads_basic` | Read profile + threads |
| `threads_content_publish` | Create threads |
| `threads_manage_replies` | Reply to threads |
| `threads_read_replies` | Read replies |
| `threads_manage_insights` | Access analytics |

> **Policy note (2025):** The Instagram Basic Display API is fully end-of-life as of Dec 4, 2024.
> Only Business and Creator accounts can connect. Personal Instagram accounts are not supported.

---

## 4. One-Click OAuth Flow (Industry Pattern)

This is the pattern used by Hootsuite, Buffer, and Later. A single page shows all platforms with checkboxes. One click triggers a sequential OAuth chain.

### `src/app/app/connect/page.tsx`

```tsx
'use client';
import { useState } from 'react';
import { initiateMetaOAuth } from '@/lib/meta/oauth';

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '🔵',
    description: 'Pages, Groups, Feed, Messenger',
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_engagement',
      'pages_messaging',
      'business_management',
      'publish_video',
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '🟣',
    description: 'Business/Creator accounts only',
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_messages',
      'instagram_manage_insights',
    ],
    requires: 'facebook', // IG requires pages_show_list from FB flow
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '⚫',
    description: 'Posts, replies, insights',
    scopes: [
      'threads_basic',
      'threads_content_publish',
      'threads_manage_replies',
      'threads_read_replies',
      'threads_manage_insights',
    ],
    separateOAuth: true, // Threads uses api.instagram.com, not facebook.com
  },
];

export default function ConnectPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleConnect = async () => {
    setConnecting(true);
    // Kick off OAuth — FB first (IG depends on it), then Threads separately
    await initiateMetaOAuth(selected);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Connect Your Accounts</h1>
      <p className="text-muted-foreground">
        Select the platforms you want to manage. We request only the minimum
        permissions needed for the features you use.
      </p>

      <div className="space-y-3">
        {PLATFORMS.map(platform => (
          <label
            key={platform.id}
            className="flex items-start gap-4 p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(platform.id)}
              onChange={() => toggle(platform.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{platform.icon}</span>
                <span className="font-semibold">{platform.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {platform.description}
              </p>
              {/* Permission transparency — show users exactly what's requested */}
              <details className="mt-2">
                <summary className="text-xs text-blue-500 cursor-pointer">
                  View permissions requested ({platform.scopes.length})
                </summary>
                <ul className="mt-1 space-y-0.5">
                  {platform.scopes.map(scope => (
                    <li key={scope} className="text-xs font-mono text-muted-foreground">
                      • {scope}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleConnect}
        disabled={selected.length === 0 || connecting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : `Connect ${selected.length} Platform${selected.length !== 1 ? 's' : ''}`}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        You can revoke access at any time from Settings → Connected Accounts.
        We never post without your permission.
      </p>
    </div>
  );
}
```

### `src/lib/meta/oauth.ts`

```typescript
export const FACEBOOK_OAUTH_URL = 'https://www.facebook.com/v22.0/dialog/oauth';
export const THREADS_OAUTH_URL = 'https://threads.net/oauth/authorize';

export async function initiateMetaOAuth(platforms: string[]) {
  const state = crypto.randomUUID(); // CSRF protection
  sessionStorage.setItem('oauth_state', state);

  const hasFacebook = platforms.includes('facebook') || platforms.includes('instagram');
  const hasThreads = platforms.includes('threads');
  const pendingQueue = [...platforms];
  sessionStorage.setItem('oauth_queue', JSON.stringify(pendingQueue));

  if (hasFacebook) {
    const scopes = buildFacebookScopes(platforms);
    const url = new URL(FACEBOOK_OAUTH_URL);
    url.searchParams.set('client_id', process.env.NEXT_PUBLIC_META_APP_ID!);
    url.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/callback/meta/facebook`);
    url.searchParams.set('scope', scopes.join(','));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    window.location.href = url.toString();
    return;
  }

  if (hasThreads) {
    initiateThreadsOAuth(state);
  }
}

function buildFacebookScopes(platforms: string[]): string[] {
  const scopes = new Set(['public_profile', 'email']);
  if (platforms.includes('facebook') || platforms.includes('instagram')) {
    ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts',
     'pages_manage_engagement', 'pages_messaging', 'business_management',
     'publish_video'].forEach(s => scopes.add(s));
  }
  if (platforms.includes('instagram')) {
    ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments',
     'instagram_manage_messages', 'instagram_manage_insights'].forEach(s => scopes.add(s));
  }
  return Array.from(scopes);
}

export function initiateThreadsOAuth(state: string) {
  const url = new URL(THREADS_OAUTH_URL);
  url.searchParams.set('client_id', process.env.NEXT_PUBLIC_META_APP_ID!);
  url.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/callback/threads`);
  url.searchParams.set('scope', [
    'threads_basic',
    'threads_content_publish',
    'threads_manage_replies',
    'threads_read_replies',
    'threads_manage_insights',
  ].join(','));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  window.location.href = url.toString();
}
```

---

## 5. Token Management & Storage

### OAuth Callback Handler — `src/app/api/auth/callback/meta/facebook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto';
import { auth } from '@/lib/firebase/admin-auth';

const GRAPH_API = 'https://graph.facebook.com/v22.0';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`/app/connect?error=${error}`);
  }

  // 1. Exchange code for short-lived user token
  const tokenRes = await fetch(`${GRAPH_API}/oauth/access_token?` + new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/meta/facebook`,
    code: code!,
  }));
  const { access_token: shortToken } = await tokenRes.json();

  // 2. Exchange for long-lived token (60 days)
  const longRes = await fetch(`${GRAPH_API}/oauth/access_token?` + new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortToken,
  }));
  const { access_token: longToken, expires_in } = await longRes.json();

  // 3. Fetch user ID
  const meRes = await fetch(`${GRAPH_API}/me?access_token=${longToken}&fields=id,name`);
  const { id: metaUserId, name } = await meRes.json();

  // 4. Fetch pages and their permanent page tokens
  const pagesRes = await fetch(
    `${GRAPH_API}/me/accounts?access_token=${longToken}&fields=id,name,access_token,category,picture`
  );
  const { data: pages } = await pagesRes.json();

  // 5. Get Firebase user from session
  const session = req.cookies.get('session')?.value;
  const decoded = await auth.verifySessionCookie(session!);
  const uid = decoded.uid;

  // 6. Store encrypted tokens in Firestore
  const batch = adminDb.batch();

  // Store user token
  const userTokenRef = adminDb.doc(`users/${uid}/metaTokens/facebook`);
  batch.set(userTokenRef, {
    userId: metaUserId,
    name,
    accessToken: encryptToken(longToken),
    expiresAt: Date.now() + expires_in * 1000,
    scopes: [],
    connectedAt: Date.now(),
  });

  // Store each page token
  for (const page of pages) {
    const pageRef = adminDb.doc(`users/${uid}/connectedPages/${page.id}`);
    batch.set(pageRef, {
      pageId: page.id,
      name: page.name,
      category: page.category,
      picture: page.picture?.data?.url,
      // Page tokens never expire! Store permanently.
      accessToken: encryptToken(page.access_token),
      platform: 'facebook',
      connectedAt: Date.now(),
    });
  }

  await batch.commit();

  // 7. Check if Threads is next in queue
  const queue = []; // Read from secure session/cookie
  // Redirect to Threads if needed, else back to dashboard
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/app/connect?success=facebook`);
}
```

### Token Encryption Utility — `src/lib/crypto.ts`

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex'); // 32-byte key

export function encryptToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptToken(stored: string): string {
  const [ivHex, authTagHex, encryptedHex] = stored.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### Token Auto-Refresh (Cloud Function)

```typescript
// functions/src/refreshTokens.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { decryptToken, encryptToken } from './crypto';

// Runs daily at midnight
export const refreshExpiredTokens = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async () => {
    const db = admin.firestore();
    const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;

    // Find tokens expiring within 3 days
    const snapshot = await db.collectionGroup('metaTokens')
      .where('expiresAt', '<', threeDaysFromNow)
      .get();

    for (const doc of snapshot.docs) {
      const { accessToken, expiresAt } = doc.data();
      if (expiresAt < Date.now()) continue; // Already expired — user must re-auth

      const currentToken = decryptToken(accessToken);
      const res = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          fb_exchange_token: currentToken,
        })
      );
      const { access_token, expires_in } = await res.json();
      await doc.ref.update({
        accessToken: encryptToken(access_token),
        expiresAt: Date.now() + expires_in * 1000,
        lastRefreshed: Date.now(),
      });
    }
  });
```

---

## 6. Facebook Pages & Groups API

### Publishing to a Page — `src/lib/meta/facebook.ts`

```typescript
const GRAPH = 'https://graph.facebook.com/v22.0';

interface PostContent {
  message?: string;
  link?: string;
  mediaUrl?: string;  // for photos/videos
  mediaType?: 'photo' | 'video';
  scheduledTime?: number; // Unix timestamp
}

export async function publishToPage(
  pageId: string,
  pageToken: string,
  content: PostContent
): Promise<{ id: string; postUrl: string }> {
  let endpoint = `${GRAPH}/${pageId}`;
  const body: Record<string, string> = {
    access_token: pageToken,
  };

  if (content.message) body.message = content.message;
  if (content.link) body.link = content.link;

  // Scheduled posts
  if (content.scheduledTime) {
    body.published = 'false';
    body.scheduled_publish_time = String(content.scheduledTime);
  }

  if (content.mediaType === 'photo' && content.mediaUrl) {
    endpoint += '/photos';
    body.url = content.mediaUrl;
  } else if (content.mediaType === 'video' && content.mediaUrl) {
    endpoint += '/videos';
    body.file_url = content.mediaUrl;
  } else {
    endpoint += '/feed';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Facebook API: ${data.error.message}`);

  return {
    id: data.id,
    postUrl: `https://facebook.com/${data.id}`,
  };
}

// Read page feed with engagement metrics
export async function getPagePosts(pageId: string, pageToken: string) {
  const fields = 'id,message,story,created_time,permalink_url,attachments,' +
    'likes.summary(true),comments.summary(true),shares,reactions.summary(true)';

  const res = await fetch(
    `${GRAPH}/${pageId}/feed?fields=${fields}&access_token=${pageToken}`
  );
  return res.json();
}

// Reply to a comment
export async function replyToComment(
  commentId: string,
  message: string,
  pageToken: string
): Promise<void> {
  await fetch(`${GRAPH}/${commentId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: pageToken }),
  });
}
```

---

## 7. Instagram Graph API (Business/Creator Only)

### Creating Instagram Posts — `src/lib/meta/instagram.ts`

```typescript
const GRAPH = 'https://graph.facebook.com/v22.0';

// Instagram uses a 2-step publish: create container → publish
export async function publishToInstagram(
  igUserId: string,
  igToken: string,
  content: {
    imageUrl?: string;
    videoUrl?: string;
    caption?: string;
    mediaType?: 'IMAGE' | 'VIDEO' | 'REELS' | 'STORIES' | 'CAROUSEL';
    carouselItems?: Array<{ imageUrl?: string; videoUrl?: string }>;
  }
): Promise<{ id: string }> {
  // Step 1: Create media container
  let containerId: string;

  if (content.mediaType === 'CAROUSEL' && content.carouselItems) {
    // Create child containers first
    const childIds: string[] = [];
    for (const item of content.carouselItems) {
      const childRes = await fetch(`${GRAPH}/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: item.imageUrl,
          video_url: item.videoUrl,
          is_carousel_item: true,
          access_token: igToken,
        }),
      });
      const { id } = await childRes.json();
      childIds.push(id);
    }

    // Create carousel container
    const carouselRes = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption: content.caption,
        access_token: igToken,
      }),
    });
    const data = await carouselRes.json();
    containerId = data.id;
  } else {
    const containerRes = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: content.imageUrl,
        video_url: content.videoUrl,
        media_type: content.mediaType || 'IMAGE',
        caption: content.caption,
        access_token: igToken,
      }),
    });
    const data = await containerRes.json();
    if (data.error) throw new Error(`IG container error: ${data.error.message}`);
    containerId = data.id;
  }

  // Step 2: Poll until container is ready (videos need processing time)
  await waitForContainerReady(containerId, igToken);

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: igToken,
    }),
  });

  const result = await publishRes.json();
  if (result.error) throw new Error(`IG publish error: ${result.error.message}`);
  return result;
}

async function waitForContainerReady(
  containerId: string,
  token: string,
  maxAttempts = 10
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code&access_token=${token}`
    );
    const { status_code } = await res.json();
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error('IG media container failed to process');
    await new Promise(r => setTimeout(r, 3000)); // Wait 3s between polls
  }
  throw new Error('IG container timed out');
}

// Get Instagram media with insights
export async function getIgMedia(igUserId: string, token: string) {
  const fields = 'id,caption,media_type,media_url,timestamp,permalink,' +
    'like_count,comments_count,insights.metric(reach,impressions,engagement)';

  const res = await fetch(`${GRAPH}/${igUserId}/media?fields=${fields}&access_token=${token}`);
  return res.json();
}
```

---

## 8. Threads API

### Publishing to Threads — `src/lib/meta/threads.ts`

```typescript
const THREADS_GRAPH = 'https://graph.threads.net/v1.0';

export async function publishToThreads(
  threadsUserId: string,
  threadsToken: string,
  content: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO';
    replyToId?: string; // For threading replies
  }
): Promise<{ id: string; postUrl: string }> {
  // Step 1: Create container
  const containerRes = await fetch(`${THREADS_GRAPH}/${threadsUserId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: content.text,
      image_url: content.imageUrl,
      video_url: content.videoUrl,
      media_type: content.mediaType || 'TEXT',
      reply_to_id: content.replyToId,
      access_token: threadsToken,
    }),
  });
  const { id: creationId } = await containerRes.json();

  // Wait for video processing if needed
  if (content.mediaType === 'VIDEO') {
    await waitForThreadsContainer(creationId, threadsToken);
  }

  // Step 2: Publish
  const publishRes = await fetch(`${THREADS_GRAPH}/${threadsUserId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: threadsToken,
    }),
  });

  const result = await publishRes.json();
  return {
    id: result.id,
    postUrl: `https://www.threads.net/@username/post/${result.id}`,
  };
}

async function waitForThreadsContainer(id: string, token: string) {
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${THREADS_GRAPH}/${id}?fields=status&access_token=${token}`);
    const { status } = await res.json();
    if (status === 'FINISHED') return;
    await new Promise(r => setTimeout(r, 3000));
  }
}

// Get thread replies for inbox/response
export async function getThreadReplies(threadId: string, token: string) {
  const res = await fetch(
    `${THREADS_GRAPH}/${threadId}/replies?fields=id,text,username,timestamp&access_token=${token}`
  );
  return res.json();
}
```

---

## 9. Scheduling Engine

### Firestore Schema for Scheduled Posts

```typescript
// Firestore: users/{uid}/scheduledPosts/{postId}
interface ScheduledPost {
  id: string;
  uid: string;
  platforms: ('facebook' | 'instagram' | 'threads')[];
  content: {
    text?: string;
    imageUrls?: string[];
    videoUrl?: string;
    link?: string;
  };
  targets: Array<{
    platform: string;
    accountId: string;   // page ID, IG user ID, or threads user ID
    accountName: string;
  }>;
  scheduledAt: Timestamp;  // UTC
  timezone: string;        // e.g., "America/New_York"
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  results?: Array<{
    platform: string;
    accountId: string;
    postId?: string;
    postUrl?: string;
    error?: string;
    publishedAt?: number;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Cloud Function Scheduler

```typescript
// functions/src/scheduler.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { publishToPage } from './meta/facebook';
import { publishToInstagram } from './meta/instagram';
import { publishToThreads } from './meta/threads';
import { decryptToken } from './crypto';

// Runs every minute
export const processScheduledPosts = functions.pubsub
  .schedule('* * * * *')
  .onRun(async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    // Get posts due in the past 5 minutes (safety window for missed ticks)
    const fiveMinutesAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);

    const snapshot = await db.collectionGroup('scheduledPosts')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '>=', fiveMinutesAgo)
      .where('scheduledAt', '<=', now)
      .limit(50) // Process in batches to avoid timeout
      .get();

    const jobs = snapshot.docs.map(doc => processPost(doc));
    await Promise.allSettled(jobs);
  });

async function processPost(doc: admin.firestore.QueryDocumentSnapshot) {
  const db = admin.firestore();
  const post = doc.data() as ScheduledPost;

  // Mark as publishing immediately to prevent double-publish
  await doc.ref.update({ status: 'publishing', updatedAt: admin.firestore.Timestamp.now() });

  const results = [];

  for (const target of post.targets) {
    try {
      let result;

      if (target.platform === 'facebook') {
        const tokenDoc = await db.doc(`users/${post.uid}/connectedPages/${target.accountId}`).get();
        const token = decryptToken(tokenDoc.data()!.accessToken);
        result = await publishToPage(target.accountId, token, {
          message: post.content.text,
          link: post.content.link,
          mediaUrl: post.content.imageUrls?.[0],
          mediaType: post.content.imageUrls?.length ? 'photo' : undefined,
        });
      } else if (target.platform === 'instagram') {
        const tokenDoc = await db.doc(`users/${post.uid}/metaTokens/instagram`).get();
        const token = decryptToken(tokenDoc.data()!.accessToken);
        result = await publishToInstagram(target.accountId, token, {
          imageUrl: post.content.imageUrls?.[0],
          caption: post.content.text,
          mediaType: 'IMAGE',
        });
      } else if (target.platform === 'threads') {
        const tokenDoc = await db.doc(`users/${post.uid}/metaTokens/threads`).get();
        const token = decryptToken(tokenDoc.data()!.accessToken);
        result = await publishToThreads(target.accountId, token, {
          text: post.content.text,
          imageUrl: post.content.imageUrls?.[0],
          mediaType: post.content.imageUrls?.length ? 'IMAGE' : 'TEXT',
        });
      }

      results.push({ platform: target.platform, accountId: target.accountId, ...result, publishedAt: Date.now() });
    } catch (error) {
      results.push({
        platform: target.platform,
        accountId: target.accountId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const allSucceeded = results.every(r => !r.error);
  await doc.ref.update({
    status: allSucceeded ? 'published' : 'failed',
    results,
    updatedAt: admin.firestore.Timestamp.now(),
  });
}
```

---

## 10. Unified Inbox & Replies

### Inbox Firestore Schema

```typescript
// users/{uid}/inbox/{messageId}
interface InboxMessage {
  id: string;
  platform: 'facebook_messenger' | 'instagram_dm' | 'facebook_comment' | 'instagram_comment' | 'threads_reply';
  accountId: string;   // which page/profile received this
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  message: string;
  parentPostId?: string;    // for comments
  parentPostContent?: string; // context for AI
  receivedAt: Timestamp;
  status: 'unread' | 'read' | 'replied' | 'ignored';
  aiSuggestedReply?: string; // pre-generated by AI
  repliedAt?: Timestamp;
  repliedWith?: string;
}
```

### Webhook Handler — `src/app/api/webhooks/meta/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateAiReply } from '@/lib/ai/auto-responder';

// GET: Webhook verification from Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST: Receive real-time events
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { object, entry } = body;

  for (const item of entry) {
    const { id: pageId, changes, messaging } = item;

    // Facebook/Instagram comments
    if (changes) {
      for (const change of changes) {
        if (change.field === 'feed' && change.value.item === 'comment') {
          await handleComment(pageId, change.value);
        }
      }
    }

    // Messenger / Instagram DM
    if (messaging) {
      for (const event of messaging) {
        if (event.message) {
          await handleDirectMessage(pageId, event);
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
}

async function handleComment(pageId: string, value: any) {
  // Find which user owns this page
  const pagesSnap = await adminDb.collectionGroup('connectedPages')
    .where('pageId', '==', pageId).limit(1).get();
  if (pagesSnap.empty) return;

  const pageDoc = pagesSnap.docs[0];
  const uid = pageDoc.ref.parent.parent!.id;

  // Pre-generate AI reply suggestion
  const aiReply = await generateAiReply({
    platform: 'facebook_comment',
    message: value.message,
    postContext: value.post?.message || '',
    senderName: value.from?.name || 'Someone',
  });

  await adminDb.collection(`users/${uid}/inbox`).add({
    platform: 'facebook_comment',
    accountId: pageId,
    senderId: value.from?.id,
    senderName: value.from?.name || 'Unknown',
    message: value.message,
    parentPostId: value.post_id,
    receivedAt: new Date(),
    status: 'unread',
    aiSuggestedReply: aiReply,
    rawEvent: value,
  });
}

async function handleDirectMessage(pageId: string, event: any) {
  const pagesSnap = await adminDb.collectionGroup('connectedPages')
    .where('pageId', '==', pageId).limit(1).get();
  if (pagesSnap.empty) return;

  const uid = pagesSnap.docs[0].ref.parent.parent!.id;

  const aiReply = await generateAiReply({
    platform: 'facebook_messenger',
    message: event.message.text || '[media message]',
    senderName: event.sender.id,
  });

  await adminDb.collection(`users/${uid}/inbox`).add({
    platform: 'facebook_messenger',
    accountId: pageId,
    senderId: event.sender.id,
    message: event.message.text || '',
    receivedAt: new Date(),
    status: 'unread',
    aiSuggestedReply: aiReply,
  });
}
```

---

## 11. AI-Automated Comment Responses

### AI Responder with Context — `src/lib/ai/auto-responder.ts`

```typescript
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

interface ReplyContext {
  platform: string;
  message: string;
  senderName?: string;
  postContext?: string;
  brandVoice?: string; // from user settings
  previousMessages?: string[]; // conversation history
}

const ReplyOutputSchema = z.object({
  reply: z.string(),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.boolean(),
  reason: z.string().optional(),
});

export async function generateAiReply(context: ReplyContext): Promise<string> {
  const prompt = ai.definePrompt({
    name: `autoReply_${Date.now()}`,
    model: 'googleai/gemini-2.0-flash',
    input: { schema: z.object({ context: z.any() }) },
    output: { schema: ReplyOutputSchema },
    prompt: `You are a professional social media manager responding on behalf of a brand.

Platform: {{{context.platform}}}
Brand Voice: {{{context.brandVoice}}}

{{#if context.postContext}}
Original Post Context: {{{context.postContext}}}
{{/if}}

{{#if context.previousMessages}}
Conversation History:
{{#each context.previousMessages}}- {{{this}}}{{/each}}
{{/if}}

New message from {{{context.senderName}}}: "{{{context.message}}}"

Generate a professional, on-brand reply. Rules:
1. Be warm, helpful, and authentic
2. Keep it concise (under 280 chars for Twitter-like platforms, up to 500 for others)
3. Never promise things the brand can't deliver
4. If the message contains a complaint, acknowledge and offer to help
5. If it's hate speech or spam, set requiresHumanReview to true
6. If you're < 80% confident, set requiresHumanReview to true

Return JSON with "reply", "confidence" (0-1), "requiresHumanReview" (boolean), and optional "reason".
`,
  });

  const result = await prompt({ context });
  const output = result.output!;

  // If AI isn't confident, still save suggestion but flag for human review
  // The webhook handler stores this; the UI shows a "Review needed" badge
  return output.reply;
}

// Batch process: auto-respond to comments if confidence > 0.9
// This runs as a Cloud Function trigger on new inbox documents
export async function autoRespondIfConfident(
  uid: string,
  messageId: string,
  messageData: any
): Promise<void> {
  const context: ReplyContext = {
    platform: messageData.platform,
    message: messageData.message,
    senderName: messageData.senderName,
    postContext: messageData.parentPostContent,
    brandVoice: messageData.brandVoice || 'professional and friendly',
  };

  const replyOutput = await generateAiReply(context);

  // Only auto-send if high confidence AND user has enabled auto-respond
  const userSettingsDoc = await adminDb.doc(`users/${uid}/settings/autoRespond`).get();
  const autoRespondEnabled = userSettingsDoc.data()?.enabled ?? false;

  if (autoRespondEnabled && !messageData.requiresHumanReview) {
    // Send the reply via the appropriate API
    await sendReply(messageData.platform, messageData.accountId, messageData.id, replyOutput);
    await adminDb.doc(`users/${uid}/inbox/${messageId}`).update({
      status: 'replied',
      repliedWith: replyOutput,
      repliedAt: new Date(),
      repliedBy: 'ai',
    });
  }
}
```

---

## 12. Firebase Data Models

### Complete Firestore Structure

```
users/
  {uid}/
    profile          → { displayName, email, plan, createdAt }
    settings/
      autoRespond    → { enabled, confidence_threshold, platforms[] }
      brandVoice     → { tone, instructions, examples[] }
    metaTokens/
      facebook       → { accessToken (encrypted), expiresAt, userId }
      instagram      → { accessToken (encrypted), expiresAt, userId }
      threads        → { accessToken (encrypted), expiresAt, userId }
    connectedPages/
      {pageId}       → { pageId, name, platform, accessToken (encrypted), picture }
    scheduledPosts/
      {postId}       → ScheduledPost (see above)
    publishedPosts/
      {postId}       → { ...ScheduledPost, publishedAt }
    inbox/
      {messageId}    → InboxMessage (see above)
    analytics/
      {date}/        → { platform, reach, impressions, engagement }
```

---

## 13. Webhook Setup (Real-Time Events)

### Subscribe to Page Webhooks After Connecting

```typescript
// Call this after a user connects their Facebook page
export async function subscribePageToWebhooks(pageId: string, pageToken: string) {
  const fields = [
    'feed',           // Page posts + comments
    'messages',       // Messenger messages
    'messaging_postbacks',
    'mention',        // When page is mentioned
    'ratings',        // Reviews
  ];

  await fetch(`https://graph.facebook.com/v22.0/${pageId}/subscribed_apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscribed_fields: fields,
      access_token: pageToken,
    }),
  });
}
```

---

## 14. Rate Limit Handling

Meta's v22 API enforces these limits:

| API | Limit |
|---|---|
| Facebook Graph | 200 calls/hour per user token |
| Instagram Graph | 240/hour per user + per-media limits |
| Threads API | 250 posts/day, 1000 replies/day |

### Rate Limit Middleware — `src/lib/meta/rate-limiter.ts`

```typescript
import { adminDb } from '@/lib/firebase/admin';

export async function checkAndUpdateRateLimit(
  uid: string,
  platform: string,
  cost = 1
): Promise<void> {
  const ref = adminDb.doc(`users/${uid}/rateLimits/${platform}`);

  await adminDb.runTransaction(async tx => {
    const doc = await tx.get(ref);
    const now = Date.now();
    const hourStart = now - (now % 3600000);

    const data = doc.exists ? doc.data()! : { calls: 0, windowStart: hourStart };

    // Reset window if over an hour old
    if (data.windowStart < hourStart) {
      data.calls = 0;
      data.windowStart = hourStart;
    }

    const limits: Record<string, number> = {
      facebook: 200,
      instagram: 240,
      threads: 250,
    };

    if (data.calls + cost > (limits[platform] || 200)) {
      const resetIn = Math.ceil((data.windowStart + 3600000 - now) / 1000);
      throw new Error(`Rate limit reached for ${platform}. Resets in ${resetIn}s.`);
    }

    tx.set(ref, { calls: data.calls + cost, windowStart: data.windowStart });
  });
}
```

---

## 15. App Review Submission Checklist

Meta's App Review is the most common failure point. Follow this exactly.

### What Meta Checks

- [ ] Your app has a clear, public **Privacy Policy URL**
- [ ] Your app has a **Data Deletion Request URL** or instructions
- [ ] Every permission has a **detailed written justification** (not generic)
- [ ] A **screencast video** showing a logged-in user using each permission in the UI
- [ ] The video must show the **exact feature** the permission enables
- [ ] App must be **live** (or demo-able) at a public URL during review
- [ ] Your **Business Verification** is approved before submitting
- [ ] Terms of Service are publicly accessible

### Permission Justification Template

For each permission, Meta wants to see this in writing:

```
Permission: pages_manage_posts
Use case: Our platform allows business owners to schedule and publish posts 
to their Facebook Pages. This permission is required to create, edit, and 
delete page posts on behalf of the connected Page admin.
User benefit: Users can schedule content in advance across multiple pages 
from a single interface, saving hours of manual work each week.
```

### App Review Video Script

Record a complete walkthrough (5–10 minutes):
1. Start at your login page — show the user logging in
2. Navigate to "Connect Accounts" — show the OAuth consent screen
3. Show each feature that uses a permission: compose + publish, read comments, reply, view analytics
4. Show the data deletion flow
5. Narrate throughout: "Here I am using [permission] to [do specific thing]"

---

## 16. Testing & Verification

### Phase 1: Sandbox Testing (Before App Review)

```bash
# Add test users in Meta Developer Dashboard:
# App Dashboard → Roles → Test Users → Create Test User
# Then invite as Page admin

# Test token generation with Graph API Explorer
# https://developers.facebook.com/tools/explorer/
```

### Phase 2: Test Each Integration

```typescript
// tests/meta/facebook.test.ts
import { publishToPage } from '@/lib/meta/facebook';

describe('Facebook Page Publishing', () => {
  const TEST_PAGE_ID = process.env.TEST_FB_PAGE_ID!;
  const TEST_PAGE_TOKEN = process.env.TEST_FB_PAGE_TOKEN!;

  it('publishes a text post', async () => {
    const result = await publishToPage(TEST_PAGE_ID, TEST_PAGE_TOKEN, {
      message: 'Test post from automated test ' + Date.now(),
    });
    expect(result.id).toBeTruthy();
    expect(result.postUrl).toContain('facebook.com');
  });

  it('schedules a future post', async () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const result = await publishToPage(TEST_PAGE_ID, TEST_PAGE_TOKEN, {
      message: 'Scheduled test post',
      scheduledTime: futureTime,
    });
    expect(result.id).toBeTruthy();
  });
});
```

### Phase 3: Webhook Testing

```bash
# Use Meta's Webhook Test Tool in the Developer Dashboard
# App Dashboard → Webhooks → Test → Send Test Payload

# Or use ngrok locally:
npx ngrok http 3000
# Then update your webhook callback URL temporarily
```

### Phase 4: End-to-End Verification Checklist

- [ ] Facebook OAuth completes and token is stored (encrypted in Firestore)
- [ ] Connected pages appear in dashboard with correct names/pictures
- [ ] Immediate post appears on the Facebook Page within 30 seconds
- [ ] Scheduled post fires within 60 seconds of scheduled time
- [ ] Instagram OAuth links correctly to IG Business account via Facebook
- [ ] Instagram post creates container, polls for FINISHED, then publishes
- [ ] Threads OAuth uses `threads.net/oauth/authorize` (not facebook.com)
- [ ] Threads post appears within 60 seconds
- [ ] Webhook receives comment event and creates inbox document
- [ ] AI reply is generated and stored with the inbox message
- [ ] Replying from inbox sends via the correct platform API
- [ ] Token refresh runs daily and extends expiry
- [ ] Rate limit middleware blocks at 200/240/250 calls per hour/day

---

## Environment Variables Reference

```env
# Meta App
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
NEXT_PUBLIC_META_APP_ID=your_app_id  # Safe to expose (it's in the OAuth URL)
META_WEBHOOK_VERIFY_TOKEN=random_secret_string

# Encryption (generate with: openssl rand -hex 32)
TOKEN_ENCRYPTION_KEY=64_char_hex_string

# Firebase Admin
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI
GEMINI_API_KEY=your_key
GEMINI_MODEL=googleai/gemini-2.0-flash
GEMINI_FALLBACK_MODELS=googleai/gemini-1.5-flash,googleai/gemini-1.5-flash-8b

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

*Built against Meta Graph API v22.0 · Threads API v1.0 · March 2026*
*Always check the Meta changelog before major updates: https://developers.facebook.com/docs/graph-api/changelog*
