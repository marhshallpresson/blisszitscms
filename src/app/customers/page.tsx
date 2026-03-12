import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FeatureTiles, FinalCtaBand, MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Customers - Use Cases for Creators and Agencies",
  description:
    "See how creators, small businesses, and agencies use Blisszits to plan, publish, and track social media.",
  path: "/customers",
  keywords: ["social media for agencies", "creator social tools", "SMB social management"],
});

const USE_CASES = [
  { title: 'Creators', description: 'Operate content planning, publishing, and AI copy flows without tool sprawl.' },
  { title: 'Small businesses', description: 'Run team workflows with approvals and basic analytics in one platform.' },
  { title: 'Agencies', description: 'Scale multi-client workspaces with approvals and report exports.' },
];

export default function CustomersPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Use Cases"
        title="Built for creators, SMB teams, and agencies"
        subtitle="Blisszits stays lean enough for small teams while supporting structured operations as complexity grows."
        actions={
          <Button asChild className="bg-[hsl(var(--mk-ink))] text-white">
            <Link href="/auth?mode=signup">Get started for free</Link>
          </Button>
        }
      >
        <FeatureTiles
          columns={3}
          items={USE_CASES.map((item, index) => ({
            title: item.title,
            description: item.description,
            tone: (['mint', 'sky', 'night'] as const)[index % 3],
          }))}
        />
      </MarketingSection>

      <ProofBand
        title="Designed for teams who need outcomes, not complexity"
        subtitle="One platform covers planning, publishing, engagement, and analytics workflows with clear capability boundaries."
        metrics={[
          { label: 'Creators', value: 'Solo to small team' },
          { label: 'SMBs', value: 'Cross-functional' },
          { label: 'Agencies', value: 'Multi-workspace' },
          { label: 'Model', value: 'Operational first' },
        ]}
      />

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title="Pick your use-case and start shipping"
          subtitle="Stand up your workspace model and run your next social cycle with fewer tools."
          primaryLabel="Get started for free"
          primaryHref="/auth?mode=signup"
          secondaryLabel="View platform"
          secondaryHref="/platform"
        />
      </MarketingSection>
    </MarketingShell>
  );
}
