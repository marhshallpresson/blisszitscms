import type { ConnectorAdapter } from '@/lib/connectors/types';
import type { NetworkKey } from '@/lib/network-capabilities';
import { linkedInAdapter } from '@/lib/connectors/linkedin-adapter';
import { facebookAdapter, instagramAdapter } from '@/lib/connectors/meta-adapter';

const ADAPTERS: Partial<Record<NetworkKey, ConnectorAdapter>> = {
  linkedin: linkedInAdapter,
  facebook: facebookAdapter,
  instagram: instagramAdapter,
};

export const getConnectorAdapter = (network: NetworkKey): ConnectorAdapter | null => {
  return ADAPTERS[network] || null;
};
