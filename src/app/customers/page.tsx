import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Customers - Use Cases for Creators and Agencies",
  description:
    "See how creators, small businesses, and agencies use Blisszits to plan, publish, and track social media.",
  path: "/customers",
  keywords: ["social media for agencies", "creator social tools", "SMB social management"],
});

const USE_CASES = [
  { title: 'Creators', description: 'Operate content planning, publishing, and AI copy flows without tool sprawl.' },
  { title: 'Small businesses', description: 'Run team workflows with approvals and basic analytics in one platform.' },
  { title: 'Agencies', description: 'Scale multi-client workspaces with approvals and report exports.' },
];

export default function CustomersPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl">Customer use-cases</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {USE_CASES.map((item) => (
            <Card key={item.title} className="border-border/70">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
