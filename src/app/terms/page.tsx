import type { Metadata } from "next";
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingSection } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Terms of Service",
  description:
    "Read the Blisszits terms covering platform usage, subscriptions, and compliance for social media workflows.",
  path: "/terms",
  keywords: ["terms of service", "platform terms", "SaaS agreement"],
});

export default function TermsPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Legal"
        title="Terms of service"
        subtitle="Use of Blisszits is subject to plan limits, platform policy compliance, and safe operation requirements."
        className="max-w-4xl py-16"
      >
        <div className="marketing-fade-up space-y-3 text-sm text-[hsl(var(--mk-muted))]">
          <p>Customers are responsible for content legality and authorization of connected network accounts.</p>
          <p>Service availability, billing, and capability boundaries follow the documented plan and integration matrix.</p>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
