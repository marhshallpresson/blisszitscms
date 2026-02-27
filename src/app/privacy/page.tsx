import type { Metadata } from "next";
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Privacy Policy",
  description:
    "Review how Blisszits handles customer data, credentials, and access controls for social media workflows.",
  path: "/privacy",
  keywords: ["privacy policy", "data handling", "social media SaaS privacy"],
});

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold">Privacy policy</h1>
        <p className="text-muted-foreground">Blisszits stores only the data required to operate workspace workflows and connected account metadata.</p>
        <p className="text-muted-foreground">Sensitive credentials and publishing tokens are handled through secure provider flows and access controls.</p>
      </section>
    </MarketingShell>
  );
}
