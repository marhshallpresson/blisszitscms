export interface WorkspaceModuleDefinition {
  title: string;
  description: string;
  status: 'live' | 'mvp' | 'planned';
}

export const WORKSPACE_MODULE_MAP: Record<string, WorkspaceModuleDefinition> = {
  dashboard: {
    title: 'Workspace Dashboard',
    description: 'Summary of scheduled posts, approvals, inbox workload, and performance snapshots.',
    status: 'live',
  },
  'content/calendar': {
    title: 'Content Calendar',
    description: 'Date-based planning with scheduled and due content visibility.',
    status: 'live',
  },
  'content/board': {
    title: 'Content Board',
    description: 'Kanban lifecycle view from idea through published.',
    status: 'live',
  },
  'content/library': {
    title: 'Content Library',
    description: 'Searchable list of posts, variants, and status filters.',
    status: 'mvp',
  },
  'content/create': {
    title: 'Create Content',
    description: 'Compose post variants, captions, scripts, and approval metadata.',
    status: 'live',
  },
  'publishing/queue': {
    title: 'Publishing Queue',
    description: 'Monitor pending and due publish jobs with run and retry controls.',
    status: 'live',
  },
  'publishing/logs': {
    title: 'Publishing Logs',
    description: 'Audit publish attempts, failures, and external post references.',
    status: 'mvp',
  },
  'publishing/errors': {
    title: 'Publishing Errors',
    description: 'Drill into failure reasons and corrective actions per job.',
    status: 'mvp',
  },
  inbox: {
    title: 'Unified Inbox',
    description: 'Cross-network threads, triage, assignments, and saved replies.',
    status: 'mvp',
  },
  analytics: {
    title: 'Analytics',
    description: 'Performance dashboards, best-time recommendations, and exports.',
    status: 'mvp',
  },
  'analytics/overview': {
    title: 'Analytics Overview',
    description: 'Top-level reach, engagement, clicks, and trend snapshots.',
    status: 'mvp',
  },
  'analytics/posts': {
    title: 'Post Analytics',
    description: 'Per-post performance and lifecycle outcome metrics.',
    status: 'planned',
  },
  'analytics/channels': {
    title: 'Channel Analytics',
    description: 'Network-level performance comparison and trend analysis.',
    status: 'planned',
  },
  'analytics/reports': {
    title: 'Reports',
    description: 'Export center for CSV and PDF reporting packs.',
    status: 'mvp',
  },
  approvals: {
    title: 'Approvals',
    description: 'Reviewer queue with approve/reject actions and comments.',
    status: 'live',
  },
  assets: {
    title: 'Media Library',
    description: 'Store and reuse media assets for post variants.',
    status: 'planned',
  },
  ai: {
    title: 'AI Studio',
    description: 'Generate ideas, scripts, captions, and repurpose content.',
    status: 'mvp',
  },
  'ai/ideas': {
    title: 'AI Ideas',
    description: 'Generate and rank content ideas by workspace context.',
    status: 'mvp',
  },
  'ai/scripts': {
    title: 'AI Scripts',
    description: 'Produce structured hook/problem/solution/CTA scripts.',
    status: 'mvp',
  },
  'ai/captions': {
    title: 'AI Captions',
    description: 'Generate platform-ready captions with tone and CTA control.',
    status: 'mvp',
  },
  'ai/repurpose': {
    title: 'AI Repurpose',
    description: 'Convert source content into LinkedIn, Instagram, and X variants.',
    status: 'planned',
  },
  'ai/history': {
    title: 'AI History',
    description: 'Track generated outputs and reuse previously approved copy.',
    status: 'planned',
  },
  settings: {
    title: 'Workspace Settings',
    description: 'Manage members, social accounts, billing, and audit controls.',
    status: 'mvp',
  },
  'settings/general': {
    title: 'General Settings',
    description: 'Workspace name, defaults, and preference configuration.',
    status: 'mvp',
  },
  'settings/members-roles': {
    title: 'Members and Roles',
    description: 'Owner, admin, editor, approver, and client-view role controls.',
    status: 'planned',
  },
  'settings/social-accounts': {
    title: 'Social Accounts',
    description: 'Connect networks and monitor account health.',
    status: 'live',
  },
  'settings/branding': {
    title: 'Branding',
    description: 'Agency white-label style and branded report settings.',
    status: 'planned',
  },
  'settings/billing': {
    title: 'Billing',
    description: 'Plan limits, usage, invoices, and add-on management.',
    status: 'planned',
  },
  'settings/audit-log': {
    title: 'Audit Log',
    description: 'Track key workspace and publishing actions.',
    status: 'planned',
  },
};
