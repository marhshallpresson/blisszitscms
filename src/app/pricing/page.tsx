import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BillingPlanCards } from '@/components/marketing/BillingPlanCards';
import { AddOnSelector } from '@/components/marketing/AddOnSelector';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { PRICING_ADDONS, PRICING_PLANS } from '@/lib/pricing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Pricing - Plans for Teams and Agencies",
  description:
    "Compare Blisszits plans for creators, teams, and agencies with publishing, inbox, analytics, and AI features.",
  path: "/pricing",
  keywords: ["social media management pricing", "agency social platform pricing", "social media SaaS plans"],
});

const FAQS = [
  {
    q: 'What is a social account?',
    a: 'A social account is one profile or page connected to Blisszits for publishing, inbox, and analytics workflows.',
  },
  {
    q: 'How does billing scale?',
    a: 'Billing scales by workspaces, social accounts, seats, and AI usage rather than oversized enterprise bundles.',
  },
  {
    q: 'Can I add white-label later?',
    a: 'Yes. White-label and advanced reporting remain optional add-ons so you can start lean and expand when needed.',
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Pricing built for growth</h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">Scale by workspaces, social accounts, seats, and AI credits without enterprise bloat.</p>
        </div>

        <div className="mt-10">
          <BillingPlanCards plans={PRICING_PLANS} />
        </div>

        <div className="mt-8">
          <AddOnSelector addons={PRICING_ADDONS} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">{faq.q}</CardTitle>
                <CardDescription>{faq.a}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
