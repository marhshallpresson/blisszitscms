# Blisszits GTM Document (Global-First)

## 1. Document Status
- Status: Go-to-market reference only.
- Last updated: February 27, 2026.
- Execution boundary: This file does not override `prd.md` implementation truth.

## 2. Positioning
Blisszits is an AI-assisted content operations platform for creators and small teams that need an affordable, workflow-first alternative to enterprise social suites.

Core positioning pillars:
1. Workflow clarity first: idea to published lifecycle with approvals and scheduling states.
2. Lean collaboration: workspace-scoped planning, comments, and role-light operations.
3. AI acceleration: built-in script/caption/hashtag generation.
4. Honest capability messaging: simulated modules are clearly labeled until production connectors ship.

## 3. ICP (Ideal Customer Profile)
### Primary ICP
1. Creator-led businesses (solo or 2-5 people).
2. UGC creators and freelancers managing multiple client workspaces.
3. Early-stage agencies needing repeatable workflow over complex enterprise governance.

### Secondary ICP
1. SMB marketing teams moving from spreadsheets/manual workflows.
2. Teams evaluating high-cost incumbents and seeking lower onboarding friction.

## 4. Global Market Framing
Market narrative for GTM:
1. Social media management demand is growing globally.
2. Tool sprawl and pricing pressure create room for a focused, workflow-centric product.
3. Buyer skepticism is high; trust requires explicit capability boundaries.

Reference signal:
- Grand View Research reports global social media management market size at about `$24.67B` (2024) and projected CAGR around `23.7%` through 2030.  
  Source: https://www.grandviewresearch.com/industry-analysis/social-media-management-market-report (captured 2026-02-27, confidence: `medium`)

## 5. Competitive Pricing Snapshot
All pricing entries must be treated as time-sensitive and re-verified before external publication.

| Product | Public anchor | Source | Capture date | Confidence |
|---|---|---|---|---|
| Buffer | Essentials `$5/channel/month`; Team `$10/channel/month`; Agency `$100/month` | https://buffer.com/pricing | 2026-02-27 | high |
| SocialPilot | Essentials `$25.50/month`; Premium `$85/month`; Ultimate `$170/month` | https://www.socialpilot.co/plans | 2026-02-27 | high |
| Hootsuite | Tiered plans visible; numeric pricing not reliably extractable in this environment | https://www.hootsuite.com/plans/business | 2026-02-27 | needs_verify |
| Sprout Social | Advanced management positioning with premium pricing posture | https://sproutsocial.com/pricing/ | 2026-02-27 | medium |

## 6. Pricing Strategy (Blisszits)
### 6.1 Principles
1. Undercut enterprise suites on entry pricing.
2. Price by workspace/channel value, not vanity feature bundles.
3. Keep AI usage transparent with soft limits and upgrade paths.

### 6.2 Suggested packaging framework
1. Starter: solo creator workflows, core AI drafting, limited workspaces.
2. Team: multi-workspace planning, approvals, expanded AI usage.
3. Agency: client workspace controls, priority support, advanced reporting/export.

### 6.3 Monetization guardrails
1. Do not promise direct publishing on unsupported networks.
2. Do not include inbox/analytics connector value in baseline pricing claims until production connectors are shipped.

## 7. API and Integration Readiness for GTM Claims
### 7.1 TikTok
- Content posting APIs are available but require scope compliance and audit for unrestricted visibility.  
  Sources: https://developers.tiktok.com/doc/content-posting-api-get-started-upload-content/ and https://developers.tiktok.com/doc/content-sharing-guidelines/ (captured 2026-02-27, confidence: `high`)

### 7.2 YouTube
- Upload is supported via `videos.insert`, subject to quota policy.  
  Sources: https://developers.google.com/youtube/v3/docs/videos/insert and https://developers.google.com/youtube/v3/determine_quota_cost (captured 2026-02-27, confidence: `medium`)

### 7.3 LinkedIn
- UGC Post API exists; migration URL used in older docs currently returns 404 and should not be used as roadmap authority.  
  Sources: https://learn.microsoft.com/en-us/linkedin/compliance/integrations/shares/ugc-post-api and https://learn.microsoft.com/en-us/linkedin/compliance/integrations/shares/ugc-post-api-migration (captured 2026-02-27, confidence: `high`)

## 8. Landing Page Messaging Guardrails
### 8.1 Allowed claims (current)
1. Multi-workspace content planning and lifecycle management.
2. AI-assisted script/caption/hashtag generation.
3. Team comments and approval workflow in app.
4. Metadata-based social account organization.

### 8.2 Disallowed claims (until shipped)
1. "Directly publish everywhere".
2. "Real-time unified inbox from all channels".
3. "Live cross-network analytics".
4. "Full OAuth social account integrations".

## 9. Claim Blacklist (Hard Block)
Do not use these statements in marketing copy until implementation parity exists:
1. "Live social listening and sentiment intelligence."
2. "Production-ready omnichannel DM synchronization."
3. "Native one-click publishing across all major networks."
4. "Real-time analytics from connected channels."

## 10. GTM Research Operations Policy
1. Every numeric claim must include URL, capture date, and confidence tag.
2. Claims tagged `needs_verify` must be manually rechecked before publication.
3. Update cadence:
- pricing and competitor claims: monthly
- platform API feasibility claims: quarterly
- market sizing claims: semiannual

## 11. Relationship to Product Spec
1. `prd.md` remains source of implementation truth.
2. `build-reality.md` controls what can be claimed as live today.
3. Any GTM copy conflict must be resolved in favor of `prd.md` + `build-reality.md`.
