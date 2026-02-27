import type { Metadata } from "next";
import { ModulePage } from '@/components/marketing/ModulePage';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Publishing - Reliable Social Scheduling",
  description:
    "Plan, schedule, and execute publishing with queue visibility, retries, and approval-safe workflows.",
  path: "/publishing",
  keywords: ["social media scheduling", "publishing workflow", "content queue"],
});

export default function PublishingPage() {
  return (
    <ModulePage
      title="Publishing"
      subtitle="Build, schedule, and execute publish jobs from a reliable queue with clear retry paths."
      highlights={[
        'Calendar and kanban planning views',
        'Per-network variants and approval-safe scheduling',
        'Queue monitor with failure reasons and rerun controls',
      ]}
      ctaLabel="Start publishing"
      ctaHref="/auth?mode=signup"
    />
  );
}
