import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { FeatureTiles, MarketingSection } from '@/components/marketing/EditorialSections';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Blisszits Blog - Social Media Operating Playbooks',
  description: 'Read practical publishing, engagement, and analytics playbooks for creators, SMBs, and agencies.',
  path: '/resources/blog',
  keywords: ['social media playbook', 'social media operations', 'content workflow tips'],
});

const POSTS = [
  {
    title: 'How to build a weekly social publishing rhythm',
    description: 'A repeatable cadence for planning, approving, scheduling, and reviewing outcomes.',
  },
  {
    title: 'Inbox triage for small teams',
    description: 'Operational rules for assignment, tags, and saved replies that reduce response lag.',
  },
  {
    title: 'Best-time-to-post in MVP mode',
    description: 'Start with rules-based windows, then mature to model-driven optimization.',
  },
];

export default function ResourcesBlogPage() {
  return (
    <MarketingShell>
      <MarketingSection
        kicker="Resources / Blog"
        title="Practical playbooks for social operators"
        subtitle="Actionable workflow guidance for planning, publishing, engagement, and analytics."
        actions={
          <Button asChild variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
            <Link href="/resources">Back to resources</Link>
          </Button>
        }
      >
        <FeatureTiles items={POSTS.map((post, index) => ({ ...post, tone: (['mint', 'sky', 'night'] as const)[index % 3] }))} columns={3} />
      </MarketingSection>
    </MarketingShell>
  );
}
