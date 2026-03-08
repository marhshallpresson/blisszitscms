import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FinalCtaBand, MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Resources - Guides, Templates, and Support",
  description:
    "Access Blisszits resources, playbooks, templates, and help center guidance for social media teams.",
  path: "/resources",
  keywords: ["social media resources", "content templates", "social growth playbooks"],
});

const RESOURCES = [
  { title: 'Blog', description: 'Tactical social growth playbooks for teams and agencies.', href: '/resources/blog' },
  { title: 'Templates', description: 'Campaign templates for calendar, scripts, and approvals.', href: '/resources/templates' },
  { title: 'Help center', description: 'Setup guides for onboarding, scheduling, and troubleshooting.', href: '/resources/help' },
  { title: 'Changelog', description: 'Track feature releases and capability updates by network.', href: '/resources/changelog' },
];

export default function ResourcesPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Resources"
        title="Playbooks and assets for social operators"
        subtitle="Use documentation and templates to onboard faster and keep execution consistent."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {RESOURCES.map((resource, index) => (
            <Link
              key={resource.title}
              href={resource.href}
              className={`marketing-fade-up rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
                index % 4 === 0
                  ? 'border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))]'
                  : index % 4 === 1
                  ? 'border-[hsl(var(--mk-sky-soft-border))] bg-[hsl(var(--mk-sky-soft))]'
                  : index % 4 === 2
                  ? 'border-[hsl(var(--mk-rose-soft-border))] bg-[hsl(var(--mk-rose-soft))]'
                  : 'border-[hsl(var(--mk-night-soft-border))] bg-[hsl(var(--mk-night-soft))] text-white'
              }`}
            >
              <h3 className="font-headline text-2xl font-semibold">{resource.title}</h3>
              <p className={`mt-2 text-sm ${index % 4 === 3 ? 'text-white/80' : 'text-[hsl(var(--mk-muted))]'}`}>{resource.description}</p>
            </Link>
          ))}
        </div>
      </MarketingSection>

      <ProofBand
        title="Support content aligned to product reality"
        subtitle="Guides, templates, and release notes are mapped to current implementation phases to keep teams informed."
        metrics={[
          { label: 'Resource hubs', value: '4' },
          { label: 'Use-case depth', value: 'Ops-focused' },
          { label: 'Update style', value: 'Changelog-first' },
          { label: 'Audience', value: 'SMB + agency' },
        ]}
      />

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title="Learn fast, execute faster"
          subtitle="Use Blisszits resources to standardize workflow quality from week one."
          primaryLabel="Start free"
          primaryHref="/auth?mode=signup"
          secondaryLabel="View platform"
          secondaryHref="/platform"
        />
      </MarketingSection>
    </MarketingShell>
  );
}
