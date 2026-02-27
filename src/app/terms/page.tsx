import type { Metadata } from "next";
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Terms of Service",
  description:
    "Read the Blisszits terms covering platform usage, subscriptions, and compliance for social media workflows.",
  path: "/terms",
  keywords: ["terms of service", "platform terms", "SaaS agreement"],
});

export default function TermsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold">Terms of service</h1>
        <p className="text-muted-foreground">Use of Blisszits is subject to subscription limits and platform API compliance requirements.</p>
        <p className="text-muted-foreground">Customers are responsible for content legality and connected network account authorization.</p>
      </section>
    </MarketingShell>
  );
}
