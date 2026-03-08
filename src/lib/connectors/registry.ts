import type { ConnectorAdapter } from '@/lib/connectors/types';
import type { NetworkKey } from '@/lib/network-capabilities';
import { linkedInAdapter } from '@/lib/connectors/linkedin-adapter';
import { facebookAdapter, instagramAdapter } from '@/lib/connectors/meta-adapter';
import { xAdapter } from '@/lib/connectors/x-adapter';
import { youtubeAdapter } from '@/lib/connectors/youtube-adapter';
import { tiktokAdapter } from '@/lib/connectors/tiktok-adapter';

const ADAPTERS: Partial<Record<NetworkKey, ConnectorAdapter>> = {
  linkedin: linkedInAdapter,
  facebook: facebookAdapter,
  instagram: instagramAdapter,
  x: xAdapter,
  youtube: youtubeAdapter,
  tiktok: tiktokAdapter,
};

export const getConnectorAdapter = (network: NetworkKey): ConnectorAdapter | null => {
  return ADAPTERS[network] || null;
};
