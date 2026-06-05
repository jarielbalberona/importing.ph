export type GuideStatus = "published" | "draft";

export type GuideCalloutTone = "info" | "warning" | "tip";

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
  steps?: string[];
  callout?: {
    title?: string;
    tone?: GuideCalloutTone;
    body: string;
  };
  faqs?: GuideFaq[];
};

export type GuideRelatedLink = {
  label: string;
  href: string;
  description?: string;
};

export type GuideAudience = "beginner-importers" | "growing-importers";

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  status: GuideStatus;
  publishedAt: string;
  updatedAt?: string;
  keywords?: string[];
  audience?: GuideAudience;
  readingTimeMinutes?: number;
  relatedLinks?: GuideRelatedLink[];
  sections: GuideSection[];
};
