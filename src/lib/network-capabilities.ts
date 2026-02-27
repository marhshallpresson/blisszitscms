export type NetworkKey =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'x';

export interface NetworkCapability {
  network: NetworkKey;
  label: string;
  canPublish: boolean;
  canSchedule: boolean;
  canFetchComments: boolean;
  canReply: boolean;
  canFetchAnalytics: boolean;
  notes?: string;
}

const NETWORK_CAPABILITIES: Record<NetworkKey, NetworkCapability> = {
  instagram: {
    network: 'instagram',
    label: 'Instagram',
    canPublish: true,
    canSchedule: true,
    canFetchComments: true,
    canReply: true,
    canFetchAnalytics: true,
  },
  facebook: {
    network: 'facebook',
    label: 'Facebook',
    canPublish: true,
    canSchedule: true,
    canFetchComments: true,
    canReply: true,
    canFetchAnalytics: true,
  },
  linkedin: {
    network: 'linkedin',
    label: 'LinkedIn',
    canPublish: true,
    canSchedule: true,
    canFetchComments: false,
    canReply: false,
    canFetchAnalytics: true,
    notes: 'Engagement endpoints are limited by integration scope.',
  },
  tiktok: {
    network: 'tiktok',
    label: 'TikTok',
    canPublish: false,
    canSchedule: false,
    canFetchComments: false,
    canReply: false,
    canFetchAnalytics: false,
    notes: 'Planned for a later phase after API program validation.',
  },
  youtube: {
    network: 'youtube',
    label: 'YouTube',
    canPublish: false,
    canSchedule: false,
    canFetchComments: false,
    canReply: false,
    canFetchAnalytics: true,
    notes: 'Publishing workflow not enabled in MVP.',
  },
  x: {
    network: 'x',
    label: 'X',
    canPublish: false,
    canSchedule: false,
    canFetchComments: false,
    canReply: false,
    canFetchAnalytics: false,
    notes: 'Deferred due to API access constraints and cost.',
  },
};

export const SUPPORTED_NETWORKS: NetworkCapability[] = Object.values(NETWORK_CAPABILITIES);
export const PUBLISH_ENABLED_NETWORKS = SUPPORTED_NETWORKS.filter((n) => n.canPublish).map((n) => n.network);

export const normalizeNetworkKey = (value?: string): NetworkKey | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'twitter') return 'x';
  if (normalized in NETWORK_CAPABILITIES) {
    return normalized as NetworkKey;
  }
  return null;
};

export const getNetworkCapability = (value?: string): NetworkCapability | null => {
  const key = normalizeNetworkKey(value);
  return key ? NETWORK_CAPABILITIES[key] : null;
};
