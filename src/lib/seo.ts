import type { Metadata } from "next";

export const siteName = "Blisszits OS";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blisszits.com";
export const defaultTitle = "Blisszits OS";
export const defaultDescription =
  "Plan, publish, reply, and track social content from one workspace with AI-assisted workflows.";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export const getPageMetadata = ({
  title,
  description,
  path,
  keywords,
}: PageMetadataInput): Metadata => {
  const url = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
};
