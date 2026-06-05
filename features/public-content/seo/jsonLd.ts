import type { Guide } from "@/features/public-content/content/types";
import { getGuidePath, getSiteUrl } from "@/features/public-content/seo/routes";

export function buildGuideArticleJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    inLanguage: "en-PH",
    mainEntityOfPage: getSiteUrl(getGuidePath(guide.slug)),
    author: {
      "@type": "Organization",
      name: "Importing Philippines",
    },
    publisher: {
      "@type": "Organization",
      name: "Importing Philippines",
    },
  };
}

export function buildGuideBreadcrumbJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getSiteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: getSiteUrl("/guides"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: getSiteUrl(getGuidePath(guide.slug)),
      },
    ],
  };
}
