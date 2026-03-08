import type { Metadata } from "next";
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FeatureTiles, MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Security - Platform Controls and Reliability",
  description:
    "Learn how Blisszits enforces workspace ownership, approval flows, and reliable publishing safeguards.",
  path: "/security",
  keywords: ["social media security", "workflow approvals", "publishing reliability"],
});

const SECURITY_ITEMS = [
  'Workspace ownership checks enforced through Firestore rules.',
  'Role and approval flows to reduce accidental publishing risk.',
  'Queue retries and idempotency guards to prevent duplicate posts.',
  'Build and release gates with typecheck + build verification.',
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Security"
        title="Security and reliability controls"
        subtitle="Blisszits applies operational safeguards across data access, approvals, and publishing workflows."
      >
        <FeatureTiles
          items={SECURITY_ITEMS.map((item, index) => ({
            title: `Control ${index + 1}`,
            description: item,
            tone: (['mint', 'sky', 'rose', 'night'] as const)[index % 4],
          }))}
        />
      </MarketingSection>

      <ProofBand
        title="Security built into the workflow engine"
        subtitle="Controls are enforced at service, data, and execution layers so operational integrity is preserved."
        metrics={[
          { label: 'Rules model', value: 'Workspace scoped' },
          { label: 'Queue model', value: 'Retry + idempotent' },
          { label: 'Auditability', value: 'Event logged' },
          { label: 'Release gate', value: 'Typecheck + build' },
        ]}
      />
    </MarketingShell>
  );
}
