import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl">Help Center</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Documentation for onboarding, publishing reliability, and day-to-day team workflows.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {HELP_ARTICLES.map((article) => (
            <Card key={article.title} className="border-border/70">
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
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
