# Blisszits

Blisszits is a Firebase-first social management platform built on Next.js App Router.

## Local commands

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm run deploy:dry-run -- --project <firebase-project-id>
npm run deploy:full -- --project <firebase-project-id> --health-url https://your-domain/api/health
```

## Security and server runtime environment

Set these environment variables for server routes:

```bash
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
INTERNAL_API_SECRET=
TOKEN_ENCRYPTION_KEY=
FIREBASE_PROJECT_ID=
DEPLOY_HEALTH_URL=
```

Optional OAuth configuration per network:

```bash
OAUTH_LINKEDIN_CLIENT_ID=
OAUTH_LINKEDIN_AUTH_URL=
OAUTH_LINKEDIN_CLIENT_SECRET=
OAUTH_LINKEDIN_SCOPE=
```

Replace `LINKEDIN` with `FACEBOOK`, `INSTAGRAM`, `YOUTUBE`, `TIKTOK`, or `X` as connectors are enabled.

Webhook secrets:

```bash
META_WEBHOOK_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
LINKEDIN_WEBHOOK_SECRET=
```

## Google Sign-In setup (App authentication)

Blisszits app authentication is Firebase-native. Google sign-in for `/auth` uses the existing Firebase web config and does **not** require server-side Google client secrets.

1. In Firebase Console, open **Authentication > Sign-in method** and enable **Google**.
2. In Firebase Console, open **Authentication > Settings > Authorized domains** and add all app domains:
   - local development domain (for example `localhost`)
   - staging domain
   - production domain
3. In Google Cloud Console, ensure OAuth consent screen is configured for your project.
4. Keep these client env vars configured:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. No `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` backend auth envs are needed for Blisszits app login/signup.

## New API surface

- `POST /api/publishing/schedule`
- `POST /api/publishing/retry`
- `POST /api/publishing/run-due`
- `GET /api/inbox/threads`
- `PATCH /api/inbox/threads`
- `POST /api/inbox/reply`
- `POST /api/inbox/sync`
- `GET /api/analytics/overview`
- `POST /api/analytics/sync`
- `GET /api/phase/status`
- `POST /api/internal/publishing/execute`
- `POST /api/internal/inbox/sync`
- `POST /api/internal/analytics/sync`
- `POST /api/integrations/:network/start`
- `GET /api/integrations/:network/callback`
- `POST /api/integrations/:network/refresh`
- `POST /api/social-accounts`
- `DELETE /api/social-accounts`
- `POST /api/workspaces/delete`
- `GET /api/webhooks/:network` (Meta verification handshake)
- `POST /api/webhooks/:network` (signature-verified inbound events)
- `GET /api/health`

## CI/CD

GitHub Actions workflows are defined in:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

`deploy.yml` now runs the repository deployment CLI so hosting deploys and post-deploy health checks stay version-controlled.
