# Blisszits Stakeholder Overview

## Executive Summary
Blisszits is a workflow-first social media operations platform designed for creators, small teams, and early-stage agencies. It brings planning, approvals, publishing readiness, inbox triage, and performance views into a single workspace so teams can run content operations without tool sprawl. The current product is a Firebase-based MVP with clearly labeled simulated areas for inbox and analytics data sources.

## Purpose and Business Value
Blisszits reduces the time and cost of running social media operations by:
- Centralizing content planning, approval, and scheduling status in one workspace.
- Providing AI-assisted drafting to speed up ideation and content creation.
- Helping teams stay aligned with clear lifecycle stages from idea to published.
- Giving leadership a structured view of work in progress and publishing readiness.
- Maintaining honest capability boundaries to protect brand trust.

## Scope Definition
### In Scope Today
- Multi-workspace content planning and lifecycle management.
- AI-assisted content drafting (plans, captions, scripts, hashtags).
- Approval and scheduling readiness workflows.
- Workspace-based inbox and analytics experiences with seeded data.
- Social account organization with metadata-based connection records.
- Server-managed scheduling and retry workflows.

### Out of Scope Today
- Live, multi-network inbox ingestion from social platforms.
- Live analytics connectors for real performance data.
- Full production publishing across all networks.

## User Personas
1. Creator-Operator
   - Runs a small content operation and needs a clear weekly workflow.
   - Values fast ideation and simple approvals.
2. UGC Strategist
   - Manages scripts and drafts for multiple client workspaces.
   - Needs predictable lifecycle stages and review status visibility.
3. Early-Stage Agency Lead
   - Coordinates client approvals, reporting, and multi-workspace work.
   - Needs consistent processes and scalable collaboration.

## Core User Workflows
1. Onboard and set up a workspace
   - User signs in and creates a workspace.
   - Workspace becomes the home for all content and activity.
2. Plan and draft content
   - User creates ideas, drafts, and variants.
   - AI tools assist with scripts, captions, and hashtags.
3. Review and approve
   - Items move through defined lifecycle stages.
   - Approvals ensure readiness before scheduling.
4. Schedule and monitor publishing readiness
   - Content is staged for scheduling with retry-safe processes.
5. Triage and respond to engagement
   - Inbox views help manage replies and status tags.
6. Review performance
   - Analytics snapshots provide performance insights for planning.

## Feature Descriptions (Plain Language)
- Workspaces: Separate client or team environments with their own content and status.
- Content lifecycle: Clear stages from idea to published to reduce confusion.
- AI drafting: Guided generation of plans, scripts, captions, and hashtags.
- Inbox: A single place to review and respond to messages and comments.
- Analytics: Performance summaries and best-time recommendations.
- Integrations: Network capability coverage is tracked and communicated clearly.

## Integration Requirements
- Social networks are represented as capabilities and connection records today.
- OAuth and live network connectivity are partially implemented for select networks.
- Webhook entry points exist for future inbox ingestion.
- Internal sync endpoints support seeded inbox and analytics data.

## Security and Compliance Considerations
- Workspace ownership and access are enforced at the data level.
- Sensitive operations are executed through authenticated server routes.
- Internal automation routes require a secret key.
- Audit logs capture sensitive workspace operations.

## Maintenance Procedures
- Verify health endpoints during deployment and ongoing monitoring.
- Use standard quality gates for release checks.
- Rotate secret keys and OAuth credentials regularly.
- Review audit logs and access patterns for unusual activity.

## Success Measures (Business-Level)
- Reduced content planning time per week.
- Higher on-time publishing rates.
- Increased team throughput per workspace.
- Lower tool overlap and subscription costs.
- Stronger stakeholder trust due to clear capability labeling.
