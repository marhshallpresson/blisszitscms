import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MarketingShell } from './MarketingShell';
import {
  FeatureTileItem,
  FeatureTiles,
  FinalCtaBand,
  HighlightList,
  MarketingSection,
  ProcessSteps,
  ProcessStep,
  ProofBand,
  ProofMetric,
} from './EditorialSections';

interface ModulePageProps {
  title: string;
  subtitle: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
  featureTiles?: FeatureTileItem[];
  processSteps?: ProcessStep[];
  proofMetrics?: ProofMetric[];
}

const defaultProcess: ProcessStep[] = [
  { title: 'Plan the workflow', description: 'Build repeatable tasks and checkpoints in one workspace.' },
  { title: 'Run with visibility', description: 'Track ownership, status, and blockers across every item.' },
  { title: 'Improve weekly', description: 'Use engagement and delivery signals to refine execution.' },
];

const defaultProof: ProofMetric[] = [
  { label: 'Activation window', value: '< 30 mins' },
  { label: 'Workflow clarity', value: 'Single source' },
  { label: 'Status coverage', value: 'Idea to publish' },
  { label: 'Team alignment', value: 'Role-ready' },
];

export const ModulePage = ({
  title,
  subtitle,
  highlights,
  ctaLabel,
  ctaHref,
  featureTiles,
  processSteps,
  proofMetrics,
}: ModulePageProps) => {
  const tiles =
    featureTiles ||
    highlights.map((item, index) => ({
      title: `Capability ${index + 1}`,
      description: item,
    }));

  return (
    <MarketingShell>
      <MarketingSection
        kicker="Module"
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <Button asChild size="lg" className="bg-[hsl(var(--mk-ink))] text-white hover:bg-[hsl(var(--mk-night-soft-border))]">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))]">
              <Link href="/auth?mode=signup">Start free</Link>
            </Button>
          </>
        }
      >
        <FeatureTiles items={tiles} />
      </MarketingSection>

      <section className="border-y border-[hsl(var(--mk-border))] bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <div className="marketing-fade-up">
            <h3 className="font-headline text-2xl font-bold text-[hsl(var(--mk-ink))]">What teams get in this module</h3>
            <p className="mt-2 text-[hsl(var(--mk-muted))]">
              The structure stays practical: clear stages, clear ownership, and clear outputs.
            </p>
          </div>
          <div className="marketing-fade-up rounded-2xl border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-paper))] p-5">
            <HighlightList items={highlights} />
          </div>
        </div>
      </section>

      <MarketingSection
        title={`${title} workflow`}
        subtitle="Designed to stay fast for small teams while remaining scalable as volume grows."
      >
        <ProcessSteps items={processSteps || defaultProcess} />
      </MarketingSection>

      <ProofBand
        title={`${title} outcomes that matter`}
        subtitle="Blisszits keeps module experiences operational, measurable, and easy to adopt."
        metrics={proofMetrics || defaultProof}
      />

      <MarketingSection className="pb-20">
        <FinalCtaBand
          title={`Launch ${title.toLowerCase()} inside your workspace`}
          subtitle="Set up your first workflow and go from planning to execution without switching platforms."
          primaryLabel={ctaLabel}
          primaryHref={ctaHref}
          secondaryLabel="Compare plans"
          secondaryHref="/pricing"
        />
      </MarketingSection>
    </MarketingShell>
  );
};
