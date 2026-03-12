import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FeatureTiles, FinalCtaBand, MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
import { MARKETING_MODULES } from '@/lib/marketing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Platform - Modular Social Media OS",
  description:
    "Explore the Blisszits platform modules for publishing, engagement, analytics, collaboration, and AI workflows.",
  path: "/platform",
  keywords: ["social media platform", "publishing workflow", "engagement inbox", "social analytics", "AI content tools"],
});

export default function PlatformPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Platform"
        title="One operating system across social workflows"
        subtitle="Blisszits structures publishing, engagement, analytics, AI, and agency operations into clear modules."
        actions={
          <>
            <Button asChild className="bg-[hsl(var(--mk-ink))] text-white">
              <Link href="/auth?mode=signup">Get started for free</Link>
            </Button>
            <Button asChild variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </>
        }
      >
        <FeatureTiles
          columns={3}
          items={MARKETING_MODULES.map((module, index) => ({
            title: module.title,
            description: module.description,
            tone: (['mint', 'sky', 'rose', 'night'] as const)[index % 4],
          }))}
        />
      </MarketingSection>

      <ProofBand
        title="Modular by design, operational in practice"
        subtitle="Each module has a dedicated conversion page and maps directly to workspace workflows inside the product."
        metrics={[
          { label: 'Modules', value: String(MARKETING_MODULES.length) },
          { label: 'Primary audience', value: 'SMBs + agencies' },
          { label: 'Experience', value: 'Web-first' },
          { label: 'Scale model', value: 'Capability-led' },
        ]}
      />

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title="Start with the modules your team needs now"
          subtitle="Adopt one workflow at a time and scale into a full social operating model."
          primaryLabel="Get started for free"
          primaryHref="/auth?mode=signup"
          secondaryLabel="View integrations"
          secondaryHref="/integrations"
        />
      </MarketingSection>
    </MarketingShell>
  );
}
