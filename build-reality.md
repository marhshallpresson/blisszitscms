# Blisszits Build Reality Baseline

## 1. Document Status
- Purpose: Implementation truth table and stabilization baseline.
- Last updated: February 27, 2026.
- Scope: Current Firebase MVP code in `src/` and build configuration.

## 2. Build Gate Snapshot
Command results from this implementation cycle:
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
| AI generation flows | live | `src/ai/flows/*`, `src/components/modals/ContentFormModal.tsx` | AI drafting features operational through server actions. | Engineering | Phase 1 |
| Legacy Genkit API route | live (legacy behavior) | `src/app/api/genkit/[...slug]/route.ts` | Route intentionally returns `410` and prevents false expectation of active endpoint. | Engineering | Phase 1 |
| Inbox experience | simulated | `src/components/inbox/InboxView.tsx` | Threads are seeded demo data; no provider ingestion. | Product + Engineering | Phase 2 |
| Analytics dashboard | simulated | `src/components/analytics/AnalyticsDashboard.tsx` | Metrics are generated mock values; export is simulated. | Product + Engineering | Phase 2 |
| Direct social publishing | blocking | No connector services/routes in codebase | Prevents true scheduled publishing to external networks. | Engineering | Phase 2 |
| OAuth social integrations | blocking | `SocialAccount.integrationMode = metadata_only` in `WorkspaceContext` | Prevents account authorization and token lifecycle. | Engineering | Phase 2 |
| Production analytics connectors | blocking | No ingestion/ETL modules present | Prevents live analytics claims. | Engineering | Phase 2 |
| Production inbox ingestion | blocking | No webhook/polling ingestion pipeline present | Prevents live DM/comment aggregation claims. | Engineering | Phase 2 |

## 4. Security and Isolation Reality
1. Firestore rules currently enforce workspace owner scope, including `social_accounts`.
2. Workspace deletion currently deletes content docs, nested comments, ideas, and social account docs before deleting workspace root.

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
- Resolution implemented: explicit "Simulated Data" labels and demo-copy updates.
- Residual risk: Low.

### P0-4 Missing spec docs
- Issue: `gtm.md` and `build-reality.md` referenced but missing.
- Resolution implemented: both docs created.
- Residual risk: Low.

### P0-5 Legacy doc encoding/reference defects
- Issue: mojibake and malformed `build-reality.md` reference in strategic docs.
- Resolution implemented: superseded notes corrected and UTF-8 cleanup pass applied.
- Residual risk: Low.

## 6. Claim Safety Matrix
What can be claimed externally now:
1. Workspace/content workflow is live.
2. AI drafting is live.
3. Social connect is metadata-only.

What cannot be claimed as live now:
1. Real unified inbox ingestion.
2. Live analytics connectors.
3. Direct multi-network publishing.
4. OAuth-based social account auth.

## 7. Next Validation Loop
1. Run CI on clean checkout: `npm ci && npm run typecheck && npm run build`.
2. Add unit tests for lifecycle transition validator.
3. Add UI tests for simulated-data labels on inbox and analytics pages.
