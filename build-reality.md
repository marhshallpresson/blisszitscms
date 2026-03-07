# Blisszits Build Reality Baseline

## 1. Document Status
- Purpose: Implementation truth table and stabilization baseline.
- Last updated: March 2, 2026.
- Scope: Current Firebase MVP code in `src/` and build configuration.

## 2. Build Gate Snapshot
Command results from this implementation cycle:
1. `npm run lint` -> pass (warnings only).
1. `npm run typecheck` -> pass (using `tsconfig.typecheck.json`).
2. `npm run build` -> pass.

Observed reliability note:
- Build output showed intermittent local `.next` manifest/chunk missing errors during repeated runs in this environment, then passed on rerun. Treat as local artifact instability risk; CI should run clean sequential builds.

## 3. Module Truth Table
| Module | Status | Evidence path | Impact | Fix owner | Target phase |
|---|---|---|---|---|---|
| Auth and onboarding routing | live | `src/app/page.tsx`, `src/app/onboarding/page.tsx`, `src/contexts/AuthContext.tsx` | Core access control works for MVP routing gates. | Engineering | Phase 1 |
| Workspace CRUD and selection | live | `src/contexts/WorkspaceContext.tsx` | Multi-workspace operations are production-backed in Firestore. | Engineering | Phase 1 |
| Content CRUD and comments | live | `src/contexts/WorkspaceContext.tsx`, `src/components/modals/ContentFormModal.tsx`, `src/components/modals/ContentDetailsModal.tsx` | Main content pipeline is functional. | Engineering | Phase 1 |
| Content status normalization | live | `src/contexts/WorkspaceContext.tsx` | Legacy + canonical status compatibility is implemented. | Engineering | Phase 1 |
| Content transition validator | live | `src/contexts/WorkspaceContext.tsx` (`isValidContentTransition`) | Invalid lifecycle jumps are blocked in service-layer update path. | Engineering | Phase 1 |
| Queue and approvals surfaces | live | `src/components/workspace/WorkspaceViewWrapper.tsx` | Scheduled and approved items are surfaced in queue UI. | Engineering | Phase 1 |
| Idea board | live | `src/components/content/IdeaBoard.tsx`, `src/contexts/WorkspaceContext.tsx` | Ideation workflow is production-backed. | Engineering | Phase 1 |
| Social account metadata | live | `src/contexts/WorkspaceContext.tsx`, `firestore.rules` (`social_accounts`) | Metadata connect/disconnect works; no OAuth tokens. | Engineering | Phase 1 |
| OAuth integration API contracts | live (Meta + LinkedIn implementation path) | `src/app/api/integrations/[network]/*`, `src/lib/connectors/*`, `src/lib/server/token-store.ts` | State validation, token exchange/refresh, and encrypted credential persistence are implemented for configured adapters. | Engineering | Phase 1 |
| Social account CRUD API | live | `src/app/api/social-accounts/route.ts`, `src/contexts/WorkspaceContext.tsx` | Social account mutations are now server-owned and authenticated; client direct writes removed. | Engineering | Phase 1 |
| AI generation flows | live | `src/ai/flows/*`, `src/components/modals/ContentFormModal.tsx` | AI drafting features operational through server actions. | Engineering | Phase 1 |
| Legacy Genkit API route | live (legacy behavior) | `src/app/api/genkit/[...slug]/route.ts` | Route intentionally returns `410` and prevents false expectation of active endpoint. | Engineering | Phase 1 |
| Publishing API + execution endpoints | live (server-managed simulation) | `src/app/api/publishing/*`, `src/app/api/internal/publishing/execute/route.ts`, `src/lib/server/publishing-service.ts` | Scheduling/retry/due-job execution moved behind authenticated API routes with idempotency/retry/dead-letter state model. External posting remains simulated. | Engineering | Phase 1 |
| Internal inbox/analytics sync endpoints | live (seed sync) | `src/app/api/internal/inbox/sync/route.ts`, `src/app/api/internal/analytics/sync/route.ts` | Internal endpoints now persist seed sync data into workspace collections and log audit events; provider ingestion is pending. | Engineering | Phase 2 |
| Webhook ingestion surface | partial | `src/app/api/webhooks/[network]/route.ts`, `src/lib/server/webhook-signature.ts`, `src/lib/server/inbox-service.ts` | Signature-verified inbound webhook endpoint is live with normalized message ingestion contract; provider-specific payload adapters are still pending. | Engineering | Phase 2 |
| CI/CD security workflows | live | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | PR verification, OIDC deploy flow, and build provenance attestation scaffolding are now committed. | Engineering | Phase 1 |
| Production phase monitor | live | `src/app/api/phase/status/route.ts`, `src/components/admin/AdminDashboard.tsx` | Admin dashboard now exposes current deployment phase, health probe result, OAuth config readiness, and blocker list. | Engineering | Phase 1 |
| Deployment CLI + hosting rollout | live | `scripts/deploy-cli.mjs`, `package.json` scripts, `.github/workflows/deploy.yml` | Hosting + rules deploy and post-deploy health checks are now version-controlled in repository automation. | Engineering | Phase 1 |
| Inbox experience | live (workspace-backed seed sync) | `src/components/inbox/InboxView.tsx`, `src/app/api/inbox/*`, `src/lib/server/inbox-service.ts` | Thread list, assignment, tags, read state, and replies now persist per workspace. Source data is still seeded/simulated, not provider webhooks. | Product + Engineering | Phase 2 |
| Analytics dashboard | live (workspace-backed seed sync) | `src/components/analytics/AnalyticsDashboard.tsx`, `src/app/api/analytics/*`, `src/lib/server/analytics-service.ts` | Chart data now loads from workspace snapshots with sync/export flow. Source metrics are seeded estimates, not provider connectors. | Product + Engineering | Phase 2 |
| Direct social publishing | partial | `src/lib/server/publishing-service.ts`, `src/lib/connectors/*` | Publish pipeline now attempts real provider posts for configured Meta/LinkedIn OAuth accounts; fallback/failed paths still occur without full account setup/scopes. | Engineering | Phase 2 |
| OAuth token exchange lifecycle | partial | `src/app/api/integrations/[network]/*`, `src/lib/server/token-store.ts` | Exchange/refresh flow exists for adapter-backed networks; remaining work is full provider onboarding UX + Secret Manager migration. | Engineering | Phase 2 |
| Production analytics connectors | blocking | No ingestion/ETL modules present | Prevents live analytics claims. | Engineering | Phase 2 |
| Production inbox ingestion | blocking | No webhook/polling ingestion pipeline present | Prevents live DM/comment aggregation claims. | Engineering | Phase 2 |

## 4. Security and Isolation Reality
1. Firestore rules enforce workspace-owner scope and now include server-managed paths (`oauth_states` deny-all, `audit_logs` read-only).
2. Publishing operations are now executed via authenticated server routes (`/api/publishing/*`) rather than direct client writes.
3. Social account mutations now execute through authenticated server route (`/api/social-accounts`) rather than client Firestore writes.
4. Internal automation routes require `x-internal-api-key` (`INTERNAL_API_SECRET`).
5. Workspace deletion now executes through authenticated server route (`/api/workspaces/delete`) and removes content/comments, ideas, social accounts, publish jobs, inbox threads/messages, analytics snapshots, and audit logs.

Evidence:
- `firestore.rules`
- `src/contexts/WorkspaceContext.tsx` (`deleteWorkspace`)

## 5. P0 Stabilization Backlog
### P0-1 Typecheck determinism
- Issue: `tsc` depended on `.next/types` presence, causing false failures.
- Resolution implemented: new `tsconfig.typecheck.json`; `npm run typecheck` points to it.
- Residual risk: Low.

### P0-2 Legacy Genkit endpoint truth
- Issue: possible confusion about route viability.
- Resolution implemented: route returns explicit `410` with migration guidance to server actions.
- Residual risk: Low.

### P0-3 Simulated feature labeling
- Issue: inbox/analytics wording implied live integrations.
- Resolution implemented: labels and copy now describe connector sync readiness and seed-synced data.
- Residual risk: Medium (provider-level ingestion still pending).

### P0-4 Missing spec docs
- Issue: `gtm.md` and `build-reality.md` referenced but missing.
- Resolution implemented: both docs created.
- Residual risk: Low.

### P0-5 Legacy doc encoding/reference defects
- Issue: mojibake and malformed `build-reality.md` reference in strategic docs.
- Resolution implemented: superseded notes corrected and UTF-8 cleanup pass applied.
- Residual risk: Low.

### P0-6 CI/CD and deployment security baseline
- Issue: no repository CI or deploy workflows.
- Resolution implemented: GitHub Actions CI workflow (lint/typecheck/build + secret scan) and OIDC-based deploy scaffold with provenance attestation.
- Residual risk: Medium (cloud secrets/workload identity bindings still need environment setup).

### P0-7 Server-side publishing controls
- Issue: publish queue operations were client-side only.
- Resolution implemented: scheduling/retry/run-due moved to authenticated API routes using Firebase Admin, with audit log writes and expanded publish job statuses (`queued`, `claimed`, `dead_letter`).
- Residual risk: Medium (provider connectors are still simulated).

### P0-8 Server-owned workspace/social mutation controls
- Issue: sensitive collections (`social_accounts`, `publish_jobs`) were client-writable.
- Resolution implemented: client writes blocked in rules; social account and workspace deletion flows moved to authenticated server APIs.
- Residual risk: Low.

## 6. Claim Safety Matrix
What can be claimed externally now:
1. Workspace/content workflow is live.
2. AI drafting is live.
3. Social connect is metadata-only.
4. Server-managed scheduling/retry endpoints are live.
5. CI/CD baseline with OIDC deploy scaffold is in place.
6. Inbox thread management and analytics snapshots are workspace-backed via sync APIs.
7. Deployment CLI manages hosting/rules rollout with health-check support.
8. OAuth exchange/refresh and real publish path are implemented for configured Meta/LinkedIn adapters.

What cannot be claimed as live now:
1. Real unified inbox ingestion.
2. Live analytics connectors.
3. Direct multi-network publishing across all planned networks.
4. Fully automated OAuth lifecycle coverage across all planned networks.

## 7. Next Validation Loop
1. Run CI on clean checkout: `npm ci && npm run typecheck && npm run build`.
2. Add unit tests for lifecycle transition validator.
3. Add UI tests for simulated-data labels on inbox and analytics pages.
