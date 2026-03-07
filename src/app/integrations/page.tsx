import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { IntegrationsCapabilityTable } from '@/components/marketing/IntegrationsCapabilityTable';
import { NETWORK_CAPABILITY_ROWS } from '@/lib/marketing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Integrations - Social Network Capabilities",
  description:
    "Review Blisszits network integrations and capability coverage for publishing, scheduling, inbox, and analytics.",
  path: "/integrations",
  keywords: ["social media integrations", "network API support", "publishing capabilities", "social inbox support"],
});

export default function IntegrationsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Integrations and capabilities</h1>
          <p className="max-w-3xl text-muted-foreground">
            Every network is mapped by real API support so teams know exactly what is available now.
          </p>
        </div>

        <Card className="mt-8 border-border/70">
          <CardHeader>
            <CardTitle>Capability matrix</CardTitle>
            <CardDescription>
              Feature availability is enforced per network so product claims always match real API support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationsCapabilityTable rows={NETWORK_CAPABILITY_ROWS} />
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
