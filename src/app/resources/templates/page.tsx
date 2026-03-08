import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FeatureTiles, MarketingSection } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Blisszits Templates - Campaign and Workflow Kits',
  description: 'Use reusable templates for campaigns, content calendars, scripts, approvals, and reports.',
  path: '/resources/templates',
  keywords: ['social media templates', 'content calendar template', 'approval workflow template'],
});

const TEMPLATES = [
  {
    title: '30-day campaign planner',
    description: 'Map ideas, due dates, and status transitions across one monthly cycle.',
  },
  {
    title: 'Hook-problem-solution-CTA script',
    description: 'A simple short-form template for AI-assisted script generation.',
  },
  {
    title: 'Approval checklist',
    description: 'Operational checklist for editor-to-approver handoff with clear completion criteria.',
  },
  {
    title: 'Weekly report pack',
    description: 'Summary template for post wins, channel trends, and queue reliability snapshots.',
  },
];

export default function ResourcesTemplatesPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Resources / Templates"
        title="Reusable templates for faster execution"
        subtitle="Structure campaigns, approvals, and reporting with prebuilt operational kits."
        actions={
          <Button asChild variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
            <Link href="/resources">Back to resources</Link>
          </Button>
        }
      >
        <FeatureTiles
          items={TEMPLATES.map((template, index) => ({
            ...template,
            tone: (['mint', 'sky', 'rose', 'night'] as const)[index % 4],
          }))}
        />
      </MarketingSection>
    </MarketingShell>
  );
}
