import { guides } from "@/features/public-content/content/guides";
import type { Guide, GuideRelatedLink } from "@/features/public-content/content/types";

export const siteOrigin = "https://importing.ph";

export const publicRoutePaths = ["/", "/how-it-works", "/guides", "/about", "/sign-in", "/sign-up"] as const;

export function getSiteUrl(pathname = "/") {
  return new URL(pathname, siteOrigin).toString();
}

export function getPublishedGuides() {
  return guides
    .filter((guide) => guide.status === "published")
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getPublishedGuideBySlug(slug: string) {
  return getPublishedGuides().find((guide) => guide.slug === slug) ?? null;
}

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug) ?? null;
}

export function getGuidePath(slug: string) {
  return `/guides/${slug}`;
}

export function getGuideMarkdownPath(slug: string) {
  return `/guides/${slug}/markdown`;
}

export function getForwarderCompanyProfilePath(companySlug: string) {
  return `/forwarder/${companySlug}`;
}

export function getPublishedGuidePaths() {
  return getPublishedGuides().map((guide) => getGuidePath(guide.slug));
}

export function isKnownPublicHref(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return true;
  }

  if (publicRoutePaths.includes(href as (typeof publicRoutePaths)[number])) {
    return true;
  }

  return getPublishedGuidePaths().includes(href);
}

function collectGuideText(section: Guide["sections"][number]) {
  const parts = [
    section.heading,
    ...(section.body ?? []),
    ...(section.bullets ?? []),
    ...(section.steps ?? []),
    section.callout?.title,
    section.callout?.body,
    ...(section.faqs?.flatMap((faq) => [faq.question, faq.answer]) ?? []),
  ];

  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function hasUnsupportedVerificationClaim(guide: Guide) {
  const haystack = [
    guide.title,
    guide.description,
    ...(guide.relatedLinks?.map((link) => `${link.label} ${link.description ?? ""}`) ?? []),
    ...guide.sections.map(collectGuideText),
  ]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("all forwarders are verified") ||
    haystack.includes("every forwarder is verified") ||
    haystack.includes("importing philippines verifies all forwarders") ||
    haystack.includes("fully verified forwarders only")
  );
}

export function validateGuideRelatedLink(link: GuideRelatedLink) {
  return isKnownPublicHref(link.href);
}
