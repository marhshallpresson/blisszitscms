import type { Metadata } from "next";
import { ModulePage } from '@/components/marketing/ModulePage';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Engagement - Unified Social Inbox",
  description:
    "Centralize social conversations with assignment, notes, and faster reply workflows in the Blisszits inbox.",
  path: "/engagement",
  keywords: ["social inbox", "community management", "engagement workflows"],
});

export default function EngagementPage() {
  return (
    <ModulePage
      title="Engagement"
      subtitle="Centralize conversations with assignment, notes, and faster team replies."
      highlights={[
        'Unified thread triage by workspace',
        'Assignment and status tracking for each thread',
        'Saved response patterns for faster handling',
      ]}
      ctaLabel="See inbox workflow"
      ctaHref="/auth?mode=signup"
    />
  );
}
