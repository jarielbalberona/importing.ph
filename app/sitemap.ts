import type { MetadataRoute } from "next";

import { getPublishedGuides, getGuidePath, getSiteUrl } from "@/features/public-content/seo/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getSiteUrl("/guides"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const guideRoutes: MetadataRoute.Sitemap = getPublishedGuides().map((guide) => ({
    url: getSiteUrl(getGuidePath(guide.slug)),
    lastModified: guide.updatedAt ?? guide.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...guideRoutes];
}
