import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { BillingPlanCards } from '@/components/marketing/BillingPlanCards';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { BestTimeWidget } from '@/components/analytics/BestTimeWidget';
import {
  EditorialHero,
  FaqAccordion,
  FeatureTiles,
  FinalCtaBand,
  MarketingSection,
  ProcessSteps,
  ProofBand,
  TrustStrip,
} from '@/components/marketing/EditorialSections';
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
    description: 'Capture ideas, drafts, variants, and approvals through one lifecycle.',
  },
  {
    title: 'Publish with reliability',
    description: 'Schedule approved content and monitor queue outcomes with safe retries.',
  },
  {
    title: 'Reply and optimize',
    description: 'Triage engagement and improve timing with best-time guidance.',
  },
];

const TRUST_PILLS = ['Built for creators', 'Built for SMB teams', 'Built for small agencies', 'No enterprise bloat'];

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

const FEATURE_TILES = [
  {
    title: 'Publish with confidence',
    description: 'Queue visibility, retries, and failure states built for operational reliability.',
    tone: 'mint' as const,
  },
  {
    title: 'Unified engagement',
    description: 'Thread assignment, status triage, and saved replies in one place.',
    tone: 'sky' as const,
  },
  {
    title: 'Analytics clarity',
    description: 'Track what performed, when to post, and where to improve next.',
    tone: 'rose' as const,
  },
  {
    title: 'AI workflow acceleration',
    description: 'Generate plans, captions, scripts, and variants without extra tools.',
    tone: 'night' as const,
  },
  {
    title: 'Agency-ready structure',
    description: 'Role-aware approvals and multi-workspace process consistency.',
    tone: 'mint' as const,
  },
  {
    title: 'Capability-driven claims',
    description: 'Network support is clearly mapped so teams know what is live now.',
    tone: 'sky' as const,
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <EditorialHero
        kicker="Social OS for SMBs and agencies"
        title="Run your social media from one place."
        subtitle="Plan, publish, reply, and track across multiple networks, with AI that shapes your next 30 days."
        actions={[
          { label: 'Start free', href: '/auth?mode=signup' },
          { label: 'See platform', href: '/platform', variant: 'secondary' },
        ]}
        statCards={[
          { label: 'Workspaces', value: '24 active' },
          { label: 'Scheduled', value: '126 posts' },
          { label: 'Approvals', value: '18 pending' },
        ]}
      />

      <TrustStrip items={TRUST_PILLS} />

      <MarketingSection
        kicker="What you get"
        title="Modules that convert planning into execution"
        subtitle="Blisszits is structured as practical modules so teams can adopt quickly and scale deliberately."
      >
        <FeatureTiles items={FEATURE_TILES} columns={3} />
      </MarketingSection>

      <ProofBand
        title="Bridge strategy and execution without app-switching"
        subtitle="Marketing teams need one operational surface for planning, approvals, publishing, inbox, and analytics. Blisszits keeps that workflow tight."
        metrics={[
          { label: 'Primary CTA', value: 'Start Free' },
          { label: 'Teams targeted', value: 'SMB + Agency' },
          { label: 'Design mode', value: 'Editorial SaaS' },
          { label: 'Execution model', value: 'Web-first' },
        ]}
      />

      <MarketingSection
        title="How Blisszits works"
        subtitle="From first idea to published outcome in three practical stages."
      >
        <ProcessSteps items={HOW_IT_WORKS} />
      </MarketingSection>

      <section className="border-y border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-mint-soft))]/50">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-3xl">
            <h2 className="font-headline text-3xl font-bold text-[hsl(var(--mk-ink))]">Best time to post, made practical</h2>
            <p className="mt-2 text-[hsl(var(--mk-muted))]">
              Start with clear posting windows from your current data, then iterate as performance signals grow.
            </p>
          </div>
          <BestTimeWidget />
        </div>
      </section>

      <MarketingSection
        title="Explore every module"
        subtitle="Each module page maps capabilities and workflows without overpromising unsupported integrations."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MARKETING_MODULES.map((module, index) => (
            <Link
              key={module.slug}
              href={module.ctaHref}
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
              <h3 className="font-headline text-2xl font-semibold">{module.title}</h3>
              <p className={`mt-2 text-sm ${index % 4 === 3 ? 'text-white/80' : 'text-[hsl(var(--mk-muted))]'}`}>{module.description}</p>
            </Link>
          ))}
        </div>
      </MarketingSection>

      <section className="border-y border-[hsl(var(--mk-border))] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-3xl font-bold text-[hsl(var(--mk-ink))]">Pricing preview</h2>
              <p className="mt-2 text-[hsl(var(--mk-muted))]">Scale by workspaces, social accounts, seats, and AI credits.</p>
            </div>
            <Button asChild variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </div>
          <BillingPlanCards plans={PRICING_PLANS.slice(0, 3)} />
        </div>
      </section>

      <MarketingSection title="Frequently asked questions" subtitle="Straight answers for teams deciding on workflow tooling.">
        <FaqAccordion items={FAQS} />
      </MarketingSection>

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title="Launch your first social workspace this week"
          subtitle="Set up your workspace, connect accounts, and ship your first 30-day cycle with one operating system."
          primaryLabel="Start free"
          primaryHref="/auth?mode=signup"
          secondaryLabel="See pricing"
          secondaryHref="/pricing"
        />
      </MarketingSection>
    </MarketingShell>
  );
}
