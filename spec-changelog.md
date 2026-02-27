# Blisszits Spec Changelog

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
