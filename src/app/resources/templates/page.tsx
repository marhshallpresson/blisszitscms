import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl">Templates</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Start faster with prebuilt structures for planning, approvals, and reporting.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {TEMPLATES.map((template) => (
            <Card key={template.title} className="border-border/70">
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/resources">Back to resources</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
