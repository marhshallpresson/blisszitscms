import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingSection, ProofBand } from '@/components/marketing/EditorialSections';
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
      <MarketingSection
        kicker="Resources / Changelog"
        title="Release history and capability updates"
        subtitle="Track real product changes tied to workflow reliability and integration coverage."
        actions={
          <Button asChild variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
            <Link href="/resources">Back to resources</Link>
          </Button>
        }
      >
        <div className="space-y-4">
          {RELEASES.map((release) => (
            <Card key={release.version} className="marketing-fade-up border-[hsl(var(--mk-border))] bg-white">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-[hsl(var(--mk-ink))]">{release.version}</CardTitle>
                  <Badge variant="outline">{release.date}</Badge>
                </div>
                <CardDescription className="text-[hsl(var(--mk-muted))]">
                  {release.highlights.map((highlight) => (
                    <div key={highlight}>- {highlight}</div>
                  ))}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <ProofBand
        title="Change tracking with execution context"
        subtitle="Every release note maps to capability coverage, workflow reliability, or platform hardening."
        metrics={[
          { label: 'Update cadence', value: 'Active' },
          { label: 'Coverage', value: 'Workflow + API' },
          { label: 'Phase tracking', value: 'Documented' },
          { label: 'Audience', value: 'Operators' },
        ]}
      />
    </MarketingShell>
  );
}
