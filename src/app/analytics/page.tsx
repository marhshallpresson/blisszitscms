import type { Metadata } from "next";
import { ModulePage } from '@/components/marketing/ModulePage';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Analytics - Social Performance Insights",
  description:
    "Track post and channel performance with Blisszits analytics, best-time recommendations, and client-ready exports.",
  path: "/analytics",
  keywords: ["social media analytics", "best time to post", "social reporting"],
});

export default function MarketingAnalyticsPage() {
  return (
    <ModulePage
      title="Analytics"
      subtitle="Track performance with clear dashboards, best-time recommendations, and export-ready reports."
      highlights={[
        'Post and channel performance cards',
        'Best-time-to-post guidance for planning',
        'CSV and PDF report exports for clients',
      ]}
      ctaLabel="Explore analytics"
      ctaHref="/auth?mode=signup"
    />
  );
}
