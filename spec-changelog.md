# Blisszits Spec Changelog

## 2026-03-02 - Server Automation and Security Baseline

## 0. New Canonical Runtime Decisions
1. Publishing queue mutations now flow through authenticated API routes, not direct client writes.
2. Internal automation routes are enabled for publishing execution, inbox sync, and analytics sync.
3. Publish job status model expanded to:
- `queued | claimed | processing | published | retrying | failed | dead_letter`
4. `SocialAccount` model expanded with:
- `credentialRef, scope, expiresAt, updatedAt`
5. OAuth route contracts added:
- `POST /api/integrations/:network/start`
- `GET /api/integrations/:network/callback`
- `POST /api/integrations/:network/refresh`

## 0.1 Security and Compliance Baseline Decisions
1. Firebase Admin-backed API utilities introduced for token verification and workspace ownership checks.
2. Internal route authentication standardized via `x-internal-api-key` and `INTERNAL_API_SECRET`.
3. Audit log writer introduced at `workspaces/{workspaceId}/audit_logs/*`.
4. Firestore rules updated with:
- server-only `oauth_states`
- read-only `audit_logs`
- stronger workspaceId consistency checks on `content`, `social_accounts`, and `publish_jobs`.
5. GitHub Actions CI/CD scaffolding added:
- CI checks: secret scan, lint, typecheck, build.
- Deploy workflow: OIDC auth to GCP, Firebase deploy, provenance attestation.
6. Deployment CLI added:
- `scripts/deploy-cli.mjs` now drives hosting/rules deploy and optional `/api/health` post-check.
7. Inbox and analytics runtime contracts added:
- `GET/PATCH /api/inbox/threads`
- `POST /api/inbox/reply`
- `POST /api/inbox/sync`
- `GET /api/analytics/overview`
- `POST /api/analytics/sync`
8. Inbox and analytics UI moved from in-memory demo state to workspace-backed sync collections:
- `workspaces/{workspaceId}/inbox_threads/*`
- `workspaces/{workspaceId}/analytics_snapshots/*`
9. OAuth runtime moved from placeholder to active adapter flow for Meta/LinkedIn:
- callback now performs token exchange through network adapters
- refresh route now rotates OAuth tokens via adapter refresh paths
- encrypted token persistence introduced in `oauth_credentials` using `TOKEN_ENCRYPTION_KEY`
10. Publishing runtime now uses connector adapters and OAuth credentials for configured networks before falling back to failure/retry handling.
11. Social account mutations migrated to authenticated server API:
- `POST /api/social-accounts`
- `DELETE /api/social-accounts`
12. Workspace deletion migrated to authenticated server API:
- `POST /api/workspaces/delete`
13. Webhook ingestion route added with signature verification and normalized inbox ingestion:
- `GET /api/webhooks/:network` (Meta handshake)
- `POST /api/webhooks/:network` (Meta/LinkedIn signature checks)
14. Firestore rule hardening applied:
- client writes disabled for `social_accounts` and `publish_jobs`

## 2026-02-27 - Product Rewrite and Reconciliation

## 1. Source-of-Truth Decisions
1. `prd.md` is the canonical implementation specification.
2. `gtm.md` is the market/pricing/positioning document.
3. `build-reality.md` is the current implementation truth ledger.
4. `new-plan.md` and `new-prd.md` are strategic references only.

## 2. Product Naming Decision
1. Product name standardized to `Blisszits` only.
2. `Blisszits CMS` and `Blisszits OS` remain historical labels in legacy docs only.

## 3. Architecture Decision
1. Phase 1 baseline locked to Firebase Auth + Firestore + RTDB + Next.js App Router.
2. Relational schema and microservice decomposition deferred to Phase 2+.

## 4. Canonical Interface Decisions
1. `Workspace` remains exported from `WorkspaceContext`.
2. Canonical `ContentStatus`:
- `idea | draft | in_progress | review | approved | scheduled | published | failed`
3. Canonical `ApprovalStatus`:
- `none | pending | approved | rejected`
4. Canonical `ContentItem` fields:
- `id, workspaceId, title, idea, script, caption, status, approvalStatus, dueDate, scheduledAt, publishedAt, variants, createdAt, updatedAt`
5. Canonical `SocialAccount` fields:
- `id, workspaceId, network, accountName, status, integrationMode, createdAt`
6. `integrationMode` allowed values:
- `metadata_only | oauth`

## 5. Lifecycle and Transition Decisions
1. Lifecycle canon: `idea -> draft -> in_progress -> review -> approved -> scheduled -> published`.
2. Exception state: `failed`.
3. New service-layer transition contract introduced:
- `isValidContentTransition(from, to, approvalStatus): boolean`
4. Invalid jumps are blocked in content update service path.

## 6. Legacy Value Mapping Decisions
| Legacy value | Canonical value |
|---|---|
| Draft | draft |
| In Progress | in_progress |
| For Review | review |
| Approved | approved |
| Scheduled | scheduled |
| Published | published |

Migration policy:
1. Read path normalizes legacy values.
2. Write path persists canonical values only.
3. Existing stored legacy values remain backward-compatible via normalization.

## 7. Build and Stability Decisions
1. `typecheck` command now uses dedicated project config for determinism:
- `tsconfig.typecheck.json`
2. Package script updated:
- `npm run typecheck` -> `tsc --noEmit --incremental false -p tsconfig.typecheck.json`
3. Build quality gates documented in `prd.md` and observed in `build-reality.md`.

## 8. Feature Truth Decisions
1. Inbox is explicitly `simulated` until ingestion connectors exist.
2. Analytics is explicitly `simulated` until real data connectors exist.
3. Social connect remains metadata-only until OAuth implementation.
4. Legacy Genkit API route remains intentionally inactive (`410`) and documented as compatibility stub.

## 9. Data and Security Decisions
1. Firestore rules include `social_accounts` owner-scoped access.
2. Workspace deletion behavior documented to include:
- content docs
- content comments
- ideas
- social account docs

## 10. GTM and Research Decisions
1. GTM uses global-first framing with confidence-tagged claims.
2. Every numeric claim must include source URL, capture date, and confidence tag.
3. `needs_verify` claims cannot be published without manual re-check.

## 11. Documentation Hygiene Decisions
1. Superseded notices fixed in `new-plan.md` and `new-prd.md`.
2. UTF-8 cleanup pass applied to legacy strategic docs.
3. Precedence conflicts resolve in favor of `prd.md`.

## 12. Open Follow-Ups
1. Add automated tests for transition validator.
2. Add CI execution of deterministic `typecheck` and clean `build`.
3. Add product telemetry to distinguish simulated vs live feature usage.

