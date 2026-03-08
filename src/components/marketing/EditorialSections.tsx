import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export type FeatureTone = 'mint' | 'sky' | 'rose' | 'night';

const featureToneClass: Record<FeatureTone, string> = {
  mint: 'bg-[hsl(var(--mk-mint-soft))] border-[hsl(var(--mk-mint-soft-border))]',
  sky: 'bg-[hsl(var(--mk-sky-soft))] border-[hsl(var(--mk-sky-soft-border))]',
  rose: 'bg-[hsl(var(--mk-rose-soft))] border-[hsl(var(--mk-rose-soft-border))]',
  night: 'bg-[hsl(var(--mk-night-soft))] border-[hsl(var(--mk-night-soft-border))] text-white',
};

export interface MarketingSectionProps {
  id?: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function MarketingSection({
  id,
  kicker,
  title,
  subtitle,
  actions,
  children,
  className,
}: MarketingSectionProps) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${className || ''}`}>
      {(kicker || title || subtitle || actions) ? (
        <div className="marketing-fade-up mb-8 max-w-3xl">
          {kicker ? (
            <Badge className="mb-4 border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))] text-[hsl(var(--mk-ink))]">
              {kicker}
            </Badge>
          ) : null}
          {title ? <h2 className="font-headline text-3xl font-bold tracking-tight text-[hsl(var(--mk-ink))] sm:text-4xl">{title}</h2> : null}
          {subtitle ? <p className="mt-3 text-base text-[hsl(var(--mk-muted))] sm:text-lg">{subtitle}</p> : null}
          {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

interface HeroMockStat {
  label: string;
  value: string;
}

export interface EditorialHeroProps {
  kicker: string;
  title: string;
  subtitle: string;
  actions: HeroAction[];
  statCards: HeroMockStat[];
}

export function EditorialHero({ kicker, title, subtitle, actions, statCards }: EditorialHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-paper))]">
      <div className="pointer-events-none absolute -left-28 top-16 h-56 w-56 rounded-full bg-[hsl(var(--mk-mint-soft))]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-[hsl(var(--mk-sky-soft))]" />
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <div className="marketing-fade-up space-y-6">
          <Badge className="border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))] text-[hsl(var(--mk-ink))]">{kicker}</Badge>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-[hsl(var(--mk-ink))] sm:text-6xl">{title}</h1>
          <p className="max-w-xl text-base text-[hsl(var(--mk-muted))] sm:text-lg">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-3">
            {actions.map((action) => (
              <Button
                key={action.href}
                asChild
                size="lg"
                variant={action.variant === 'secondary' ? 'outline' : 'default'}
                className={
                  action.variant === 'secondary'
                    ? 'border-[hsl(var(--mk-border))] bg-white text-[hsl(var(--mk-ink))] hover:bg-[hsl(var(--mk-paper))]'
                    : 'bg-[hsl(var(--mk-ink))] text-white hover:bg-[hsl(var(--mk-night-soft-border))]'
                }
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="marketing-fade-up flex items-end justify-center lg:justify-end">
          <div className="relative w-full max-w-xl rounded-3xl border border-[hsl(var(--mk-border))] bg-white p-4 shadow-[0_16px_50px_rgba(11,28,48,0.12)]">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-paper))] p-3">
                  <p className="text-xs text-[hsl(var(--mk-muted))]">{card.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[hsl(var(--mk-ink))]">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))] p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--mk-muted))]">Queue</p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--mk-ink))]">95.8%</p>
                <p className="mt-1 text-xs text-[hsl(var(--mk-muted))]">scheduled success</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--mk-sky-soft-border))] bg-[hsl(var(--mk-sky-soft))] p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--mk-muted))]">Inbox</p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--mk-ink))]">2h</p>
                <p className="mt-1 text-xs text-[hsl(var(--mk-muted))]">median response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustStrip({ items }: { items: string[] }) {
  return (
    <section className="border-b border-[hsl(var(--mk-border))] bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-6 sm:px-6 lg:px-8">
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="border-[hsl(var(--mk-border))] bg-white px-3 py-1 text-[hsl(var(--mk-muted))]"
          >
            {item}
          </Badge>
        ))}
      </div>
    </section>
  );
}

export interface FeatureTileItem {
  title: string;
  description: string;
  tone?: FeatureTone;
}

export function FeatureTiles({ items, columns = 2 }: { items: FeatureTileItem[]; columns?: 2 | 3 | 4 }) {
  const gridClass =
    columns === 4
      ? 'md:grid-cols-2 xl:grid-cols-4'
      : columns === 3
      ? 'md:grid-cols-2 xl:grid-cols-3'
      : 'md:grid-cols-2';

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {items.map((item, index) => {
        const tone = item.tone || (['mint', 'sky', 'rose', 'night'] as FeatureTone[])[index % 4];
        return (
          <Card key={`${item.title}-${index}`} className={`marketing-fade-up border ${featureToneClass[tone]}`}>
            <CardHeader>
              <CardTitle className={tone === 'night' ? 'text-white' : 'text-[hsl(var(--mk-ink))]'}>{item.title}</CardTitle>
              <CardDescription className={tone === 'night' ? 'text-white/80' : 'text-[hsl(var(--mk-muted))]'}>
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

export interface ProcessStep {
  title: string;
  description: string;
}

export function ProcessSteps({ items }: { items: ProcessStep[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((step, index) => (
        <Card key={step.title} className="marketing-fade-up border-[hsl(var(--mk-border))] bg-white">
          <CardHeader>
            <Badge className="mb-2 w-fit border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))] text-[hsl(var(--mk-ink))]">
              Step {index + 1}
            </Badge>
            <CardTitle className="text-[hsl(var(--mk-ink))]">{step.title}</CardTitle>
            <CardDescription className="text-[hsl(var(--mk-muted))]">{step.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export interface ProofMetric {
  label: string;
  value: string;
}

export function ProofBand({
  title,
  subtitle,
  metrics,
}: {
  title: string;
  subtitle: string;
  metrics: ProofMetric[];
}) {
  return (
    <section className="border-y border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-sky-soft))]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div className="marketing-fade-up">
          <h3 className="font-headline text-3xl font-bold text-[hsl(var(--mk-ink))]">{title}</h3>
          <p className="mt-3 max-w-2xl text-[hsl(var(--mk-muted))]">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <Card key={metric.label} className="marketing-fade-up border-[hsl(var(--mk-border))] bg-white">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--mk-muted))]">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--mk-ink))]">{metric.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Card className="border-[hsl(var(--mk-border))] bg-white">
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`} className="border-[hsl(var(--mk-border))]">
              <AccordionTrigger className="text-left text-[hsl(var(--mk-ink))] hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(var(--mk-muted))]">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function FinalCtaBand({
  title,
  subtitle,
  primaryLabel = 'Start free',
  primaryHref = '/auth?mode=signup',
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  subtitle: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Card className="border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-night-soft))] text-white">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">{title}</CardTitle>
        <CardDescription className="mx-auto max-w-2xl text-white/80">{subtitle}</CardDescription>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-[hsl(var(--mk-mint))] text-[hsl(var(--mk-ink))] hover:bg-[hsl(var(--mk-mint-strong))]">
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {secondaryLabel && secondaryHref ? (
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  );
}

export function HighlightList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-[hsl(var(--mk-muted))]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-[hsl(var(--mk-mint-strong))]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
