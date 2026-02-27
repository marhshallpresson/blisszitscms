import type { Metadata } from "next";
import { ModulePage } from '@/components/marketing/ModulePage';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits Agency Workflows - Multi-Client Operations",
  description:
    "Run multi-client approvals, reporting, and shared workflows with Blisszits agency tools.",
  path: "/agency",
  keywords: ["agency social media tools", "client approvals", "white-label reporting"],
});

export default function AgencyPage() {
  return (
    <ModulePage
      title="Agency Workflows"
      subtitle="Manage multiple brands, approvals, and client handoffs with role-based controls."
      highlights={[
        'Workspace-per-client operating model',
        'Editor to approver routing with clear statuses',
        'Client reporting and shared visibility',
      ]}
      ctaLabel="See agency setup"
      ctaHref="/pricing"
    />
  );
}
