import type { Metadata } from "next";

import type { Guide } from "@/features/public-content/content/types";
import { getGuideMarkdownPath, getGuidePath, getSiteUrl } from "@/features/public-content/seo/routes";

const defaultOgImage = "/assets/importingph-logo-bg-blue.png";

export function buildGuidesIndexMetadata(): Metadata {
  const title = "Guides | Importing Philippines";
  const description =
    "Beginner-friendly guides for China-to-Philippines importing, shipping quotes, cargo basics, and forwarder comparisons.";

  return {
    title,
    description,
    alternates: {
      canonical: getGuidePath("").replace(/\/$/, "") || "/guides",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: getSiteUrl("/guides"),
      images: [getSiteUrl(defaultOgImage)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getSiteUrl(defaultOgImage)],
    },
  };
}

export function buildAboutMetadata(): Metadata {
  const title = "About Importing Philippines";
  const description =
    "Importing Philippines helps importers organize China-to-Philippines shipment requests, receive private forwarder quotes, and compare options in one place.";
  const canonical = "/about";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: getSiteUrl(canonical),
      images: [getSiteUrl(defaultOgImage)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getSiteUrl(defaultOgImage)],
    },
  };
}

export function buildGuideMetadata(guide: Guide): Metadata {
  const canonical = getGuidePath(guide.slug);

  return {
    title: `${guide.title} | Importing Philippines`,
    description: guide.description,
    keywords: guide.keywords,
    alternates: {
      canonical,
      types: {
        "text/markdown": getGuideMarkdownPath(guide.slug),
      },
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: getSiteUrl(canonical),
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: [getSiteUrl(defaultOgImage)],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [getSiteUrl(defaultOgImage)],
    },
  };
}
