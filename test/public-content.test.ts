import test from "node:test";
import assert from "node:assert/strict";

import sitemap from "@/app/sitemap";
import { getPublishedGuideMarkdown } from "@/features/public-content/ai-readable/registry";
import { guides } from "@/features/public-content/content/guides";
import { buildGuideMetadata } from "@/features/public-content/seo/metadata";
import {
  getGuideBySlug,
  getGuidePath,
  getPublishedGuideBySlug,
  getPublishedGuides,
  hasUnsupportedVerificationClaim,
  validateGuideRelatedLink,
} from "@/features/public-content/seo/routes";

test("guide slugs are unique", () => {
  const slugs = guides.map((guide) => guide.slug);

  assert.equal(new Set(slugs).size, slugs.length);
});

test("draft guides are hidden from published guide inventory", () => {
  const publishedSlugs = getPublishedGuides().map((guide) => guide.slug);

  assert.ok(!publishedSlugs.includes("draft-guide-example"));
});

test("draft guide detail lookup returns null for public published access", () => {
  assert.equal(getPublishedGuideBySlug("draft-guide-example"), null);
  assert.notEqual(getGuideBySlug("draft-guide-example"), null);
});

test("metadata exists for each published guide and uses guide title and description", () => {
  for (const guide of getPublishedGuides()) {
    const metadata = buildGuideMetadata(guide);

    assert.equal(metadata.description, guide.description);
    assert.equal(metadata.title, `${guide.title} | Importing Philippines`);
    assert.equal(metadata.alternates?.canonical, getGuidePath(guide.slug));
  }
});

test("sitemap includes published guide routes and excludes draft guide routes", () => {
  const entries = sitemap().map((entry) => entry.url);

  for (const guide of getPublishedGuides()) {
    assert.ok(entries.includes(`https://importing.ph${getGuidePath(guide.slug)}`));
  }

  assert.ok(!entries.includes("https://importing.ph/guides/draft-guide-example"));
});

test("published guides have markdown mirrors and drafts do not", () => {
  for (const guide of getPublishedGuides()) {
    const markdown = getPublishedGuideMarkdown(guide.slug);

    assert.ok(markdown);
    assert.ok(markdown.includes(`# ${guide.title}`));
  }

  assert.equal(getPublishedGuideMarkdown("draft-guide-example"), null);
});

test("related links point to known public routes or published guides", () => {
  for (const guide of getPublishedGuides()) {
    for (const link of guide.relatedLinks ?? []) {
      assert.equal(validateGuideRelatedLink(link), true, `${guide.slug} -> ${link.href}`);
    }
  }
});

test("guide sources use secure external URLs", () => {
  for (const guide of getPublishedGuides()) {
    for (const source of guide.sources ?? []) {
      const url = new URL(source.href);
      assert.equal(url.protocol, "https:", `${guide.slug} -> ${source.href}`);
      assert.ok(source.publisher.trim().length > 0, guide.slug);
    }
  }
});

test("guide content does not overclaim forwarder verification", () => {
  for (const guide of guides) {
    assert.equal(hasUnsupportedVerificationClaim(guide), false, guide.slug);
  }
});
