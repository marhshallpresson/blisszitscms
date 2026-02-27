import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from './MarketingShell';

export const ModulePage = ({
  title,
  subtitle,
  highlights,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  subtitle: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
}) => {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <Card key={item} className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle className="text-lg">Key capability</CardTitle>
                <CardDescription>{item}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
};
