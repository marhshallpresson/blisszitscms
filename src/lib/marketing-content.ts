export interface MarketingModule {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
}

export const MARKETING_MODULES: MarketingModule[] = [
  {
    slug: 'publishing',
    title: 'Publishing Engine',
    description: 'Plan, schedule, and publish with queue visibility and retry-safe workflows.',
    highlights: [
      'Calendar, queue, and per-network variants',
      'Scheduled jobs with retry and idempotency',
      'Approval-aware publishing pipeline',
    ],
    ctaLabel: 'Open Publishing',
    ctaHref: '/publishing',
  },
  {
    slug: 'engagement',
    title: 'Unified Inbox',
    description: 'Manage replies and conversations from one workspace command center.',
    highlights: [
      'Thread triage with filters and statuses',
      'Assignment and internal collaboration notes',
      'Saved replies and faster response loops',
    ],
    ctaLabel: 'View Engagement',
    ctaHref: '/engagement',
  },
  {
    slug: 'analytics',
    title: 'Analytics and Best Time',
    description: 'Track content performance and identify when to post for stronger reach.',
    highlights: [
      'Post and channel overview metrics',
      'Best-time-to-post recommendations',
      'Export-ready reports for clients and teams',
    ],
    ctaLabel: 'Explore Analytics',
    ctaHref: '/analytics',
  },
  {
    slug: 'ai',
    title: 'AI Assistant',
    description: 'Generate plans, captions, scripts, and repurposed variants in minutes.',
    highlights: [
      '30-day plan generator for onboarding',
      'Caption, hashtag, and script outline tools',
      'Repurpose one idea across network formats',
    ],
    ctaLabel: 'Try AI Studio',
    ctaHref: '/ai',
  },
  {
    slug: 'agency',
    title: 'Agency Workflows',
    description: 'Run client approvals, reviews, and reporting from one workspace model.',
    highlights: [
      'Role-based approvals and change visibility',
      'Multi-workspace operations for client teams',
      'Client-ready exports and shared reporting',
    ],
    ctaLabel: 'See Agency',
    ctaHref: '/agency',
  },
  {
    slug: 'white-label',
    title: 'White-label',
    description: 'Present a branded portal and reporting workflow for client-facing teams.',
    highlights: [
      'Branded portal and report delivery',
      'Custom domain and presentation controls',
      'High-margin add-on for agency plans',
    ],
    ctaLabel: 'Explore White-label',
    ctaHref: '/white-label',
  },
];

export interface NetworkCapabilityRow {
  network: string;
  publish: boolean;
  schedule: boolean;
  inbox: boolean;
  analytics: boolean;
  note: string;
}

export const NETWORK_CAPABILITY_ROWS: NetworkCapabilityRow[] = [
  {
    network: 'Instagram',
    publish: true,
    schedule: true,
    inbox: true,
    analytics: true,
    note: 'Primary  network.',
  },
  {
    network: 'Facebook',
    publish: true,
    schedule: true,
    inbox: true,
    analytics: true,
    note: 'Primary network.',
  },
  {
    network: 'LinkedIn',
    publish: true,
    schedule: true,
    inbox: false,
    analytics: true,
    note: 'Engagement endpoints vary by scope.',
  },
  {
    network: 'TikTok',
    publish: false,
    schedule: false,
    inbox: false,
    analytics: false,
    note: 'Phase 2 pending API program constraints.',
  },
  {
    network: 'YouTube',
    publish: false,
    schedule: false,
    inbox: false,
    analytics: true,
    note: 'Analytics first, publishing later.',
  },
  {
    network: 'X',
    publish: false,
    schedule: false,
    inbox: false,
    analytics: false,
    note: 'Deferred due to access and cost constraints.',
  },
];
