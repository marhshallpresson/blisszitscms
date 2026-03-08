import type { Metadata } from "next";
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingSection } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Privacy Policy",
  description:
    "Review how Blisszits handles customer data, credentials, and access controls for social media workflows.",
  path: "/privacy",
  keywords: ["privacy policy", "data handling", "social media SaaS privacy"],
});

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Legal"
        title="Privacy policy"
        subtitle="Blisszits stores only data required for workspace workflows and connected account operations."
        className="max-w-4xl py-16"
      >
        <div className="marketing-fade-up space-y-3 text-sm text-[hsl(var(--mk-muted))]">
          <p>Sensitive credentials and publishing tokens are handled through secure provider flows and access controls.</p>
          <p>Workspace-level permissions, audit logs, and role boundaries are enforced as part of the core product model.</p>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
