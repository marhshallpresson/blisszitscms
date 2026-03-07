# Blisszits BRD and PRD

## Executive Summary
Blisszits is a workflow-first social media operations platform for creators, small teams, and early-stage agencies. The product centralizes planning, approvals, publishing readiness, inbox triage, and performance views in a workspace model. The current release is a Firebase-based MVP with honest labeling for simulated inbox and analytics data sources.

## Business Requirements Document (BRD)
### Business Objectives
- Reduce operational overhead for content teams by unifying planning and approvals.
- Improve content production speed using AI-assisted drafting.
- Provide visibility into readiness and workflow status across workspaces.
- Maintain trust through clear capability boundaries.

### Scope
#### In Scope
- Workspace-based content planning and lifecycle tracking.
- AI-assisted content generation tools.
- Approval workflows and scheduling readiness states.
- Inbox and analytics views with seeded data and sync endpoints.
- Social account organization and capability mapping.

#### Out of Scope
- Full live integration coverage for all social networks.
- Real-time analytics connector ingestion.
- Complete production inbox aggregation across platforms.

### User Personas
1. Creator-Operator: needs fast planning, lightweight approvals, and clear status.
2. UGC Strategist: needs consistent review stages across client workspaces.
3. Agency Lead: needs scalable workflow visibility and reporting readiness.
4. Marketing Coordinator: needs dependable scheduling readiness for campaigns.

### Business Value
- Faster production cycles and fewer bottlenecks.
- Lower cost compared to enterprise social suites.
- Improved collaboration with clear status visibility.
- Better onboarding through guided workflows and AI assistance.

### Risks and Mitigations
- Risk: Overpromising live integrations.
  - Mitigation: Maintain explicit simulated vs live labeling in product and messaging.
- Risk: Incomplete network coverage.
  - Mitigation: Provide capability matrix and staged roadmap communication.

### Success Metrics
- Weekly active workspaces.
- Time from idea to approved content.
- Percentage of content items moving to scheduled state.
- Content throughput per workspace.
- Retention of teams after onboarding.

### Maintenance Requirements
- Routine health checks via published health endpoint.
- Scheduled reviews of secrets and OAuth credentials.
- Regular data hygiene for workspace cleanup.
- Ongoing review of audit logs and access controls.

## Product Requirements Document (PRD)
### Product Vision
Enable small teams to run reliable, repeatable social media operations without enterprise complexity.

### Product Goals
- Provide a clear content lifecycle from idea to published.
- Support multi-workspace operations with simple collaboration.
- Deliver AI-assisted drafting that reduces creation time.
- Offer transparent capability coverage and integration readiness.

### Functional Requirements
1. Authentication and Onboarding
   - Users can sign in and are routed into onboarding and the app.
   - Onboarding captures profile details to personalize workspace setup.
2. Workspaces
   - Users can create, view, and manage multiple workspaces.
   - Workspace selection drives navigation and data context.
3. Content Management
   - Users can create and edit ideas, drafts, and variants.
   - Content items track lifecycle status and approval state.
4. Approvals and Lifecycle
   - Items move through defined stages with validation to prevent invalid jumps.
   - Approved content can be scheduled and monitored for readiness.
5. AI Assistance
   - Users can generate plans, captions, scripts, and hashtags.
   - AI output is stored with content items for reuse.
6. Social Accounts
   - Users can add social accounts as metadata records.
   - OAuth connections are partially available for select networks.
7. Inbox
   - Users can view threads and respond within a workspace.
   - Current data sources are seeded and synchronized through internal endpoints.
8. Analytics
   - Users can view performance snapshots and best-time guidance.
   - Current data sources are seeded and synchronized through internal endpoints.
9. Publishing Operations
   - Scheduling, retry, and due-run operations are server-managed.
   - External publishing to all networks is not yet fully live.
10. Admin and Status
   - Admin views display current system phase and health readiness.

### User Stories and Acceptance Criteria
1. As a creator, I want to capture ideas so I can build a weekly content plan.
   - Acceptance: I can add ideas and see them in the idea board.
2. As a strategist, I want to move drafts through review so approvals are visible.
   - Acceptance: I can change status only along approved lifecycle steps.
3. As a team lead, I want to schedule approved content so publishing readiness is clear.
   - Acceptance: Approved items can be scheduled and appear in queue views.
4. As a user, I want AI help drafting scripts so I can work faster.
   - Acceptance: AI outputs are generated and saved to the content item.
5. As a workspace owner, I want to keep my workspace data private.
   - Acceptance: Users cannot access or modify other workspaces.
6. As a community manager, I want to reply to inbox threads in one place.
   - Acceptance: I can view threads, send replies, and update statuses.
7. As a stakeholder, I want to understand feature readiness.
   - Acceptance: Simulated features are clearly labeled in the UI and messaging.

### Integration Requirements
- Support OAuth token exchange and refresh for selected networks.
- Provide network capability matrix to show publish, schedule, inbox, and analytics coverage.
- Maintain webhook endpoints for future inbound inbox ingestion.
- Provide internal sync endpoints for seeded data updates.

### Security and Compliance Requirements
- Enforce workspace-level access control at the data layer.
- Require authenticated server routes for sensitive mutations.
- Protect internal automation routes with shared secret keys.
- Maintain audit logs for critical workspace operations.
- Use encrypted storage for OAuth credentials.

### Technical Constraints
- Firebase-based MVP architecture is the baseline.
- App routing uses Next.js App Router.
- Simulated inbox and analytics remain non-live until connectors are production-ready.
- Quality gates require successful lint, typecheck, and build before release.

### Non-Functional Requirements
- Reliability: scheduling and retry workflows must be idempotent.
- Performance: dashboard and workflow views must load within expected UI timeframes.
- Transparency: all simulated modules must be labeled and documented.

### Implementation Roadmap (High-Level)
Phase 1: MVP Foundation
- Stable authentication and onboarding.
- Workspace management and content lifecycle.
- AI drafting tools.
- Server-managed scheduling operations.
- Simulated inbox and analytics with seeded data.

Phase 2: Live Integrations
- Production inbox ingestion connectors.
- Live analytics pipelines.
- Expanded OAuth coverage and network publishing.

Phase 3: Scale and Automation
- Enhanced reporting and exports.
- Advanced agency workflows and white-label options.
- Expanded automation and compliance tooling.

### Success Metrics
- Activation rate after onboarding.
- Monthly active workspaces.
- Percentage of content items that reach scheduled state.
- AI tool usage per workspace.
- Retention and expansion by plan tier.

### Maintenance Procedures
- Scheduled health checks for API and publishing workflows.
- Regular rotation of secret keys and OAuth credentials.
- Review audit logs for anomalies.
- Quarterly capability review to keep claims accurate.
