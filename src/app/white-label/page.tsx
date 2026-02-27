import type { Metadata } from "next";
import { ModulePage } from '@/components/marketing/ModulePage';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits White-Label - Branded Client Experience",
  description:
    "Deliver a branded client experience with white-label reporting, exports, and presentation controls.",
  path: "/white-label",
  keywords: ["white-label social media", "branded reporting", "agency white-label"],
});

export default function WhiteLabelPage() {
  return (
    <ModulePage
      title="White-label"
      subtitle="Brand your client experience with custom reports and branded workflows."
      highlights={[
        'Branded exports and client-ready reporting',
        'Agency-facing presentation controls',
        'Add-on packaging for high-margin upsell',
      ]}
      ctaLabel="Contact sales"
      ctaHref="/pricing"
    />
  );
}
