import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const ROUTES = [
  "/",
  "/platform",
  "/publishing",
  "/engagement",
  "/analytics",
  "/ai",
  "/agency",
  "/pricing",
  "/integrations",
  "/customers",
  "/resources",
  "/security",
  "/privacy",
  "/terms",
  "/white-label",
];

const HIGH_PRIORITY = new Set(["/", "/platform", "/pricing", "/publishing", "/engagement", "/analytics", "/ai"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: HIGH_PRIORITY.has(path) ? "weekly" : "monthly",
    priority: HIGH_PRIORITY.has(path) ? 0.9 : 0.6,
  }));
}
