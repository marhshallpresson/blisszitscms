import type { Metadata } from "next";
import { ModulePage } from '@/components/marketing/ModulePage';
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Blisszits AI Studio - Generate Social Content Faster",
  description:
    "Use Blisszits AI Studio to generate campaign plans, captions, hashtags, and repurposed content variants.",
  path: "/ai",
  keywords: ["AI social media content", "caption generator", "social media planning AI"],
});

export default function AiPage() {
  return (
    <ModulePage
      title="AI Studio"
      subtitle="Generate campaign plans, scripts, captions, and repurposed variants without extra tools."
      highlights={[
        '30-day plan generation during onboarding',
        'Caption and hashtag suggestions',
        'Script outline and cross-network repurpose flow',
      ]}
      ctaLabel="Open AI features"
      ctaHref="/auth?mode=signup"
    />
  );
}
