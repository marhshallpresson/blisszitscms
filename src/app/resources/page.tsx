import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Resources - Guides, Templates, and Support",
  description:
    "Access Blisszits resources, playbooks, templates, and help center guidance for social media teams.",
  path: "/resources",
  keywords: ["social media resources", "content templates", "social growth playbooks"],
});

const RESOURCES = [
  { title: 'Blog', description: 'Tactical social growth playbooks for teams and agencies.', href: '/resources/blog' },
  { title: 'Templates', description: 'Campaign templates for calendar, scripts, and approvals.', href: '/resources/templates' },
  { title: 'Help center', description: 'Setup guides for onboarding, scheduling, and troubleshooting.', href: '/resources/help' },
  { title: 'Changelog', description: 'Track feature releases and capability updates by network.', href: '/resources/changelog' },
];

export default function ResourcesPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl">Resources</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {RESOURCES.map((resource) => (
            <Link key={resource.title} href={resource.href}>
              <Card className="border-border/70 transition hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
