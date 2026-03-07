import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Blisszits Changelog - Product and Capability Updates',
  description: 'Track Blisszits releases for publishing, inbox, analytics, and API capability updates.',
  path: '/resources/changelog',
  keywords: ['product changelog', 'social media platform releases', 'feature updates'],
});

const RELEASES = [
  {
    version: 'v0.7',
    date: 'March 2026',
    highlights: ['Workspace module route map expanded', 'Queue monitor + publishing logs views', 'Reusable pricing and integrations components'],
  },
  {
    version: 'v0.6',
    date: 'February 2026',
    highlights: ['Canonical content lifecycle locked', 'Publish jobs model introduced', 'Auth/onboarding route normalization'],
  },
];

export default function ResourcesChangelogPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl">Changelog</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Product update history focused on real capability changes and operational reliability.
        </p>
        <div className="mt-8 space-y-4">
          {RELEASES.map((release) => (
            <Card key={release.version} className="border-border/70">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{release.version}</CardTitle>
                  <Badge variant="outline">{release.date}</Badge>
                </div>
                <CardDescription>
                  {release.highlights.map((highlight) => (
                    <div key={highlight}>- {highlight}</div>
                  ))}
                </CardDescription>
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
