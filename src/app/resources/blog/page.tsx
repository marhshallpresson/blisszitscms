import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl">Blog</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Tactical guides for teams shipping social workflows without enterprise overhead.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {POSTS.map((post) => (
            <Card key={post.title} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
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
