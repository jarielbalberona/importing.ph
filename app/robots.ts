import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/features/public-content/seo/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getSiteUrl("/sitemap.xml"),
  };
}
