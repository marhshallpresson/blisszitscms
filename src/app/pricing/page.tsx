import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { BillingPlanCards } from '@/components/marketing/BillingPlanCards';
import { AddOnSelector } from '@/components/marketing/AddOnSelector';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FaqAccordion, FinalCtaBand, MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
import { PRICING_ADDONS, PRICING_PLANS } from '@/lib/pricing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Pricing - Plans for Teams and Agencies",
  description:
    "Compare Blisszits plans for creators, teams, and agencies with publishing, inbox, analytics, and AI features.",
  path: "/pricing",
  keywords: ["social media management pricing", "agency social platform pricing", "social media SaaS plans"],
});

const FAQS = [
  {
    q: 'What is a social account?',
    a: 'A social account is one profile or page connected to Blisszits for publishing, inbox, and analytics workflows.',
  },
  {
    q: 'How does billing scale?',
    a: 'Billing scales by workspaces, social accounts, seats, and AI usage rather than oversized enterprise bundles.',
  },
  {
    q: 'Can I add white-label later?',
    a: 'Yes. White-label and advanced reporting remain optional add-ons so you can start lean and expand when needed.',
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Pricing"
        title="Pricing built for growth, not enterprise overhead"
        subtitle="Scale by workspaces, social accounts, seats, and AI credits with transparent add-ons."
        actions={
          <Button asChild className="bg-[hsl(var(--mk-ink))] text-white">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
        }
      >
        <BillingPlanCards plans={PRICING_PLANS} />
      </MarketingSection>

      <section className="border-y border-[hsl(var(--mk-border))] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <AddOnSelector addons={PRICING_ADDONS} />
        </div>
      </section>

      <ProofBand
        title="Pricing anchored to how teams naturally scale"
        subtitle="Start lean, expand accounts and seats as demand grows, and add white-label only when needed."
        metrics={[
          { label: 'Entry plan', value: '$0' },
          { label: 'Starter', value: '$15-$29' },
          { label: 'Team range', value: '$49-$99' },
          { label: 'Agency range', value: '$149-$299' },
        ]}
      />

      <MarketingSection title="Pricing FAQs" subtitle="Common questions before rollout.">
        <FaqAccordion items={FAQS} />
      </MarketingSection>

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title="Pick a plan and ship your first campaign"
          subtitle="Create a workspace, connect accounts, and move from draft to scheduled content quickly."
          primaryLabel="Start free"
          primaryHref="/auth?mode=signup"
          secondaryLabel="See platform"
          secondaryHref="/platform"
        />
      </MarketingSection>
    </MarketingShell>
  );
}
