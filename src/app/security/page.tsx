import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Security - Platform Controls and Reliability",
  description:
    "Learn how Blisszits enforces workspace ownership, approval flows, and reliable publishing safeguards.",
  path: "/security",
  keywords: ["social media security", "workflow approvals", "publishing reliability"],
});

const SECURITY_ITEMS = [
  'Workspace ownership checks enforced through Firestore rules.',
  'Role and approval flows to reduce accidental publishing risk.',
  'Queue retries and idempotency guards to prevent duplicate posts.',
  'Build and release gates with typecheck + build verification.',
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold">Security and reliability</h1>
        <div className="mt-8 grid gap-4">
          {SECURITY_ITEMS.map((item) => (
            <Card key={item} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Security control</CardTitle>
                <CardDescription>{item}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
