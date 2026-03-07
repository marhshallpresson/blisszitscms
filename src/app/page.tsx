import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { BillingPlanCards } from '@/components/marketing/BillingPlanCards';
import { BestTimeWidget } from '@/components/analytics/BestTimeWidget';
import { MARKETING_MODULES } from '@/lib/marketing-content';
import { PRICING_PLANS } from '@/lib/pricing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits OS - Social Media Operating System for Teams",
  description:
    "Blisszits unifies planning, publishing, inbox, and analytics so teams can run social media from one workspace.",
  path: "/",
  keywords: [
    "social media management platform",
    "social media OS",
    "content planning and publishing",
    "social inbox",
    "social analytics",
  ],
});

const HOW_IT_WORKS = [
  {
    title: 'Plan in one workspace',
    description: 'Create ideas, drafts, variants, and approvals using a unified content lifecycle.',
  },
  {
    title: 'Publish with queue reliability',
    description: 'Schedule approved posts, monitor publish jobs, and retry failures without duplicates.',
  },
  {
    title: 'Reply and optimize',
    description: 'Manage engagement and track what performs with analytics and best-time guidance.',
  },
];

const TRUST_PILLS = ['Built for creators', 'Built for SMB teams', 'Built for small agencies'];

const FAQS = [
  {
    q: 'What is a social account?',
    a: 'A social account is one connected profile or page used for publishing, inbox, and analytics workflows.',
  },
  {
    q: 'Which platforms can I publish to today?',
    a: 'MVP publishing focuses on Meta and LinkedIn. Other networks are added by capability matrix phase.',
  },
  {
    q: 'Do you support inbox and DMs?',
    a: 'Inbox support is network-specific and expands by API capability. Feature badges are shown per integration.',
  },
  {
    q: 'Do you have mobile apps?',
    a: 'Mobile is planned after web-first reliability milestones and workflows are stable.',
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-background via-background to-primary/10">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="space-y-6">
            <Badge variant="secondary">Social OS for SMBs and agencies</Badge>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Run your social media from one place.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Plan, publish, reply, and track across multiple networks with AI that builds your next 30 days.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground">
                <Link href="/auth?mode=signup">Start free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/platform">See demo flow</Link>
              </Button>
            </div>
          </div>
          <Card className="border-border/70 bg-card/80 shadow-xl">
            <CardHeader>
              <CardTitle>Product Preview</CardTitle>
              <CardDescription>Publishing queue + inbox + analytics in one workspace shell.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-md border border-border/60 bg-background p-3">Calendar with status-based workflow and per-platform variants</div>
              <div className="rounded-md border border-border/60 bg-background p-3">Queue monitor with retry-safe publish jobs and failure reasons</div>
              <div className="rounded-md border border-border/60 bg-background p-3">Unified inbox and analytics modules with capability-driven rollouts</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/40">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-6 sm:px-6 lg:px-8">
          {TRUST_PILLS.map((pill) => (
            <Badge key={pill} variant="outline" className="px-3 py-1">
              {pill}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MARKETING_MODULES.map((module) => (
            <Card key={module.slug} className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={module.ctaHref}>Explore module</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl font-bold">How Blisszits works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <Card key={step.title} className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <BestTimeWidget />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h2 className="font-headline text-3xl font-bold">Pricing preview</h2>
          <Button asChild variant="outline">
            <Link href="/pricing">Compare plans</Link>
          </Button>
        </div>
        <BillingPlanCards plans={PRICING_PLANS.slice(0, 3)} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-headline text-3xl font-bold">FAQs</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">{faq.q}</CardTitle>
                <CardDescription>{faq.a}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card className="mt-8 border-border/70 bg-card/70">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Start running social from one workspace</CardTitle>
            <CardDescription>Launch your first workspace, connect accounts, and schedule your first 30 days.</CardDescription>
            <div className="pt-3">
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/auth?mode=signup">Start free</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>
    </MarketingShell>
  );
}
