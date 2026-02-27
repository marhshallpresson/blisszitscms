import type { Metadata } from "next";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { NETWORK_CAPABILITY_ROWS } from '@/lib/marketing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Integrations - Social Network Capabilities",
  description:
    "Review Blisszits network integrations and capability coverage for publishing, scheduling, inbox, and analytics.",
  path: "/integrations",
  keywords: ["social media integrations", "network API support", "publishing capabilities", "social inbox support"],
});

const mark = (value: boolean) => (value ? 'Yes' : 'No');

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

        <div className="mt-8 grid gap-4">
          {NETWORK_CAPABILITY_ROWS.map((row) => (
            <Card key={row.network} className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{row.network}</CardTitle>
                <CardDescription>{row.note}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm">
                <Badge variant={row.publish ? 'default' : 'outline'}>Publish: {mark(row.publish)}</Badge>
                <Badge variant={row.schedule ? 'default' : 'outline'}>Schedule: {mark(row.schedule)}</Badge>
                <Badge variant={row.inbox ? 'default' : 'outline'}>Inbox: {mark(row.inbox)}</Badge>
                <Badge variant={row.analytics ? 'default' : 'outline'}>Analytics: {mark(row.analytics)}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
