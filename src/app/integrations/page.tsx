import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { IntegrationsCapabilityTable } from '@/components/marketing/IntegrationsCapabilityTable';
import { FinalCtaBand, MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
import { NETWORK_CAPABILITY_ROWS } from '@/lib/marketing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Integrations - Social Network Capabilities",
  description:
    "Review Blisszits network integrations and capability coverage for publishing, scheduling, inbox, and analytics.",
  path: "/integrations",
  keywords: ["social media integrations", "network API support", "publishing capabilities", "social inbox support"],
});

export default function IntegrationsPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Integrations"
        title="Capability-driven network support"
        subtitle="Every network is mapped by real API support so product claims stay aligned with implementation."
        actions={
          <Button asChild className="bg-[hsl(var(--mk-ink))] text-white">
            <Link href="/auth?mode=signup">Get started for free</Link>
          </Button>
        }
      >
        <Card className="border-[hsl(var(--mk-border))] bg-white">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--mk-ink))]">Capability matrix</CardTitle>
            <CardDescription className="text-[hsl(var(--mk-muted))]">
              Publishing, scheduling, inbox, and analytics coverage by network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationsCapabilityTable rows={NETWORK_CAPABILITY_ROWS} />
          </CardContent>
        </Card>
      </MarketingSection>

      <ProofBand
        title="Integration truth before growth claims"
        subtitle="Blisszits uses a capability matrix policy so roadmap and marketing stay anchored to real connector state."
        metrics={[
          { label: 'Primary launch', value: 'Meta + LinkedIn' },
          { label: 'Phase 2', value: 'YouTube + TikTok' },
          { label: 'Deferred', value: 'X' },
          { label: 'Policy', value: 'No overclaims' },
        ]}
      />

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title="Connect what is live and scale network-by-network"
          subtitle="Start with supported connectors today and expand as capability gates are cleared."
          primaryLabel="Get started for free"
          primaryHref="/auth?mode=signup"
          secondaryLabel="View pricing"
          secondaryHref="/pricing"
        />
      </MarketingSection>
    </MarketingShell>
  );
}
