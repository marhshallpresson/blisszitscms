import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FeatureTiles, MarketingSection } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Blisszits Help Center - Setup and Troubleshooting',
  description: 'Find setup guides for onboarding, workspace routing, queue reliability, and inbox operations.',
  path: '/resources/help',
  keywords: ['social media help center', 'publishing queue troubleshooting', 'onboarding guide'],
});

const HELP_ARTICLES = [
  {
    title: 'Connect social accounts',
    description: 'Configure account metadata, supported capabilities, and workspace-scoped access.',
  },
  {
    title: 'Schedule and run publish jobs',
    description: 'Queue approved content, process due jobs, and retry failed network attempts.',
  },
  {
    title: 'Use inbox assignment and tags',
    description: 'Route conversations by owner, status, and tag taxonomy to reduce response lag.',
  },
  {
    title: 'Understand simulated vs live features',
    description: 'Read feature-truth labels so team expectations match current implementation scope.',
  },
];

export default function ResourcesHelpPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Resources / Help"
        title="Help center for everyday operations"
        subtitle="Setup and troubleshooting guides to keep teams shipping consistently."
        actions={
          <Button asChild variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
            <Link href="/resources">Back to resources</Link>
          </Button>
        }
      >
        <FeatureTiles
          items={HELP_ARTICLES.map((article, index) => ({
            ...article,
            tone: (['mint', 'sky', 'rose', 'night'] as const)[index % 4],
          }))}
        />
      </MarketingSection>
    </MarketingShell>
  );
}
