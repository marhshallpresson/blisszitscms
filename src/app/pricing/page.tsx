import type { Metadata } from "next";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Pricing - Plans for Teams and Agencies",
  description:
    "Compare Blisszits plans for creators, teams, and agencies with publishing, inbox, analytics, and AI features.",
  path: "/pricing",
  keywords: ["social media management pricing", "agency social platform pricing", "social media SaaS plans"],
});

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    points: ['1 workspace', '2 social accounts', 'Limited scheduling', 'Starter AI credits'],
  },
  {
    name: 'Starter',
    price: '$15-$29/mo',
    points: ['1 workspace', '5 social accounts', 'Scheduling + publishing', 'Basic analytics'],
  },
  {
    name: 'Pro Team',
    price: '$49-$99/mo',
    points: ['Approvals + inbox', '3-10 seats', 'Expanded AI credits', 'Priority support'],
  },
  {
    name: 'Agency',
    price: '$149-$299/mo',
    points: ['Multi-workspace', 'Client approvals', 'White-label reports', 'Advanced exports'],
  },
];

const ADDONS = ['Extra social accounts ($3-$5/account/month)', 'AI credit packs', 'White-label portal', 'Advanced analytics templates'];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Pricing built for growth</h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">Scale by workspaces, social accounts, seats, and AI credits without enterprise bloat.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <Card key={plan.name} className="border-border/70">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-foreground">{plan.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.points.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-border/70">
          <CardHeader>
            <CardTitle>Add-ons</CardTitle>
            <CardDescription>High-margin upgrades that map directly to account growth.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {ADDONS.map((addon) => (
                <li key={addon}>- {addon}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
