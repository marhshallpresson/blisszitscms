import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MARKETING_MODULES } from '@/lib/marketing-content';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Platform - Modular Social Media OS",
  description:
    "Explore the Blisszits platform modules for publishing, engagement, analytics, collaboration, and AI workflows.",
  path: "/platform",
  keywords: ["social media platform", "publishing workflow", "engagement inbox", "social analytics", "AI content tools"],
});

export default function PlatformPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Blisszits Platform</h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            A modular social operating system covering publishing, engagement, analytics, collaboration, and AI.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MARKETING_MODULES.map((module) => (
            <Card key={module.slug} className="border-border/70">
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={module.ctaHref}>Open {module.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
