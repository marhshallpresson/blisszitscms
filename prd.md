# Product Requirements Document (PRD): Blisszits

## 1. Document Status
- Status: Canonical implementation-facing product and technical specification.
- Last updated: February 27, 2026.
- Product name policy: Use `Blisszits` only.
- Execution precedence: `prd.md` > `build-reality.md` > `spec-changelog.md` > `new-plan.md` / `new-prd.md`.

## 2. Product Summary
Blisszits is a Firebase-first content operations app for creators and small teams. It supports workspace-based content planning, AI-assisted drafting, collaboration comments, approvals, scheduling state, and publishing state tracking.

Current phase is a Firebase MVP. Some experiences are intentionally simulated and must be labeled as such.

## 3. Goals and Non-Goals
### 3.1 Goals (Phase 1)
1. Deliver a stable, buildable, testable Firebase MVP.
2. Provide a clear content lifecycle from idea to published.
3. Keep implementation truth explicit using `Implemented`, `Simulated`, and `Planned` labels.
4. Preserve a clean path to Phase 2 architecture without forcing early migration.

### 3.2 Non-Goals (Phase 1)
1. No immediate migration to relational database or microservices.
2. No production OAuth token management for social publishing.
3. No production-grade omnichannel inbox ingestion.
4. No production-grade analytics connectors.

## 4. Target Users
1. Individual creators running repeatable content workflows.
2. UGC creators and strategists handling scripts and approvals.
3. Small teams operating multiple workspaces.

## 5. Canonical Architecture (Locked)
1. Frontend: Next.js App Router, React, Tailwind, shadcn.
2. Backend baseline: Firebase Auth, Firestore, RTDB user preferences.
3. AI layer: Genkit server actions with Gemini provider.
4. Phase 1 API model: internal context/service contracts.
5. Phase 2 API model: external REST contracts after Firebase parity.

## 6. Feature Truth Matrix
Legend:
- `Implemented`: Production-backed in current MVP.
- `Simulated`: Demo data or generated placeholders.
- `Planned`: Roadmap only.

| Capability | Truth | Notes |
|---|---|---|
| Auth + onboarding routing | Implemented | Redirect flow `/auth` -> `/onboarding` -> `/app/dashboard`. |
| Workspace CRUD | Implemented | Owner-scoped Firestore workspaces. |
| Content CRUD | Implemented | Firestore-backed content docs. |
| Content comments | Implemented | Firestore subcollection under content item. |
| Idea board | Implemented | Firestore-backed status board. |
| AI workspace/content generation | Implemented | Genkit server actions. |
| Content lifecycle states | Implemented | Canonical enum with normalization and transition validator. |
| Social account connect | Implemented | Metadata-only records, no OAuth tokens. |
| Inbox | Simulated | Seeded threads; no platform ingestion. |
| Analytics | Simulated | Generated metrics and simulated export. |
| Direct social publishing | Planned | Phase 2+ integration objective. |
| Social listening/sentiment | Planned | Phase 2+ objective. |

## 7. Canonical Interfaces and Types
These are implementation contracts for Phase 1.

### 7.1 Workspace
- `id`
- `name`
- `description?`
- `ownerId`
- `contentCount?`
- `createdAt?`
- `updatedAt?`

### 7.2 ContentStatus
```ts
'idea' | 'draft' | 'in_progress' | 'review' | 'approved' | 'scheduled' | 'published' | 'failed'
```

### 7.3 ApprovalStatus
```ts
'none' | 'pending' | 'approved' | 'rejected'
```

### 7.4 ContentItem
- `id`
- `workspaceId`
- `title`
- `idea?`
- `script?`
- `caption?`
- `status?`
- `approvalStatus?`
- `dueDate?`
- `scheduledAt?`
- `publishedAt?`
- `variants?`
- `createdAt?`
- `updatedAt?`

### 7.5 SocialAccount (MVP)
- `id`
- `workspaceId`
- `network`
- `accountName`
- `status`
- `integrationMode`
- `createdAt?`

`integrationMode` values:
- `metadata_only` (current MVP)
- `oauth` (future)

## 8. Canonical Lifecycle and Transition Policy
### 8.1 Canonical lifecycle
`idea -> draft -> in_progress -> review -> approved -> scheduled -> published`

Exception state: `failed`

### 8.2 Service-layer transition contract
```ts
isValidContentTransition(from, to, approvalStatus): boolean
```

### 8.3 Transition rules
1. No-op transition is valid (`from === to`).
2. Transition to `failed` is allowed where explicitly configured in transition map.
3. `approved` requires `approvalStatus = approved`.
4. `scheduled` requires `approvalStatus = approved`.
5. Invalid jumps are blocked in service layer.

### 8.4 Legacy status mapping
- `Draft` -> `draft`
- `In Progress` -> `in_progress`
- `For Review` -> `review`
- `Approved` -> `approved`
- `Scheduled` -> `scheduled`
- `Published` -> `published`

Normalization policy:
1. Read-path normalizes legacy values.
2. Write-path persists canonical enum values.

## 9. Data and Security Baseline
1. Firestore rules enforce owner scope by workspace.
2. Child collection scope must include:
- `content`
- `content/{id}/comments`
- `ideas`
- `social_accounts`
3. Workspace deletion must remove declared child docs before deleting workspace root.

## 10. Build and Release Quality Gates
Required for release:
1. `npm run typecheck` passes deterministically.
2. `npm run build` passes.
3. No hidden suppression of TS or lint errors.

Current P0 stabilization decision:
- Typecheck uses dedicated config (`tsconfig.typecheck.json`) to avoid `.next/types` coupling.

## 11. Acceptance Test Scenarios
1. Auth routing:
- Unauthenticated user redirects to `/auth`.
- Authenticated non-onboarded user redirects to `/onboarding`.
- Onboarded user lands on `/app/dashboard`.
2. Workspace isolation:
- User cannot access another workspace documents.
3. Lifecycle validation:
- Valid transitions pass.
- Invalid transitions fail with service-layer error.
4. Queue and filter integrity:
- `scheduled` appears in queue and filters.
5. Social accounts:
- Owner-scoped CRUD works in `social_accounts`.
6. Truth labeling:
- Inbox and analytics views clearly marked simulated.
7. AI flows:
- Workspace plan, script, caption, hashtag flows return typed outputs and safe errors.
8. Workspace deletion cleanup:
- Content, comments, ideas, and social account docs are removed.

## 12. External Research Addendum (Global-First)
Policy for all numeric claims:
- include source URL
- include capture date
- include confidence tag (`high`, `medium`, `needs_verify`)

### 12.1 Competitor pricing anchors
- Buffer Essentials: `$5/channel/month` billed yearly; Team: `$10/channel/month` billed yearly.  
  Source: https://buffer.com/pricing (captured 2026-02-27, confidence: `high`)
- SocialPilot Essentials: `$25.50/month`, Premium: `$85/month`, Ultimate: `$170/month` (annual billing shown).  
  Source: https://www.socialpilot.co/plans (captured 2026-02-27, confidence: `high`)
- Hootsuite pricing page currently renders plan tiers but static extraction omits numeric values in this environment; numeric claims require manual confirmation at publish time.  
  Source: https://www.hootsuite.com/plans/business (captured 2026-02-27, confidence: `needs_verify`)

### 12.2 Platform API feasibility anchors
- TikTok Content Posting API supports upload/draft and direct posting workflows with scope-gated access and audit requirements for unrestricted visibility.  
  Source: https://developers.tiktok.com/doc/content-posting-api-get-started-upload-content/ and https://developers.tiktok.com/doc/content-sharing-guidelines/ (captured 2026-02-27, confidence: `high`)
- YouTube Data API includes upload via `videos.insert` and daily quota model.  
  Source: https://developers.google.com/youtube/v3/docs/videos/insert and https://developers.google.com/youtube/v3/determine_quota_cost (captured 2026-02-27, confidence: `medium`, due conflicting summary vs table text on quota page)
- LinkedIn UGC Post API is available; legacy migration URL referenced in older strategy docs currently returns 404 and must not be treated as active implementation guidance.  
  Source: https://learn.microsoft.com/en-us/linkedin/compliance/integrations/shares/ugc-post-api and https://learn.microsoft.com/en-us/linkedin/compliance/integrations/shares/ugc-post-api-migration (captured 2026-02-27, confidence: `high` for availability + `high` for migration URL 404)

### 12.3 Firebase cost and limits anchors
- Firebase uses Spark (no-cost) and Blaze (pay-as-you-go) plans; paid product usage beyond free quota requires Blaze billing linkage.  
  Source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans (captured 2026-02-27, confidence: `high`)
- Firestore free tier baseline includes 50,000 reads/day and 20,000 writes/day, with documented hard limits and scaling constraints.  
  Source: https://firebase.google.com/docs/firestore/quotas (captured 2026-02-27, confidence: `high`)

## 13. Phase 2 Appendix (Strategic, Non-Binding for MVP)
1. Relational data model and service decomposition remain Phase 2+.
2. External REST APIs remain Phase 2+.
3. OAuth-based social publishing remains Phase 2+.
4. Production inbox ingestion and analytics connectors remain Phase 2+.

Non-goal reminder:
- Phase 2 architecture does not redefine current MVP acceptance criteria.
