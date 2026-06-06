import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { getPublishedGuides } from "@/features/public-content/seo/routes";
import sitemap from "@/app/sitemap";
import {
  defaultBaseUrl,
  getAuditTargets,
  hasDeveloperFacingCopy,
  resolveSeoOptions,
  validateKeywordLimit,
} from "@/scripts/seo/config";
import { requireDataForSeoCredentials, shouldExecuteLiveDataForSeo } from "@/scripts/seo/providers/dataforseo";
import { createMockSeoProvider } from "@/scripts/seo/providers/mock";
import { createSeoProvider, getMetadataSnapshotForRoute, getStaticRouteCoverage, withCachedResult } from "@/scripts/seo/lib";

test("default provider is mock", () => {
  const options = resolveSeoOptions("keyword-plan", []);
  assert.equal(options.provider, "mock");
  assert.equal(options.baseUrl, defaultBaseUrl);
});

test("DataForSEO credentials are not required for mock mode", async () => {
  const options = resolveSeoOptions("keyword-plan", []);
  const provider = createSeoProvider(options);
  const result = await provider.getKeywordPlan({
    keywords: ["shipping quote Philippines"],
    market: "ph",
  });

  assert.equal(result.length, 1);
});

test("DataForSEO credentials are required only for dataforseo mode", () => {
  assert.throws(
    () => requireDataForSeoCredentials({} as NodeJS.ProcessEnv),
    /DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are required/,
  );
});

test("live calls are dry-run unless confirm-live is passed", () => {
  assert.equal(
    shouldExecuteLiveDataForSeo({ provider: "dataforseo", confirmLive: false }),
    false,
  );
  assert.equal(
    shouldExecuteLiveDataForSeo({ provider: "dataforseo", confirmLive: true }),
    true,
  );
});

test("keyword limits are enforced", () => {
  assert.throws(
    () => validateKeywordLimit(6, 5, 10, false, "serp-rank"),
    /exceeds soft limit 5/,
  );
  assert.throws(
    () => validateKeywordLimit(11, 5, 10, true, "serp-rank"),
    /exceeds hard limit 10/,
  );
});

test("cache-only avoids provider calls", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "seo-workbench-"));
  const options = resolveSeoOptions("keyword-plan", ["--cache-dir", tmpDir]);
  let called = 0;

  await withCachedResult(options, "keyword-plan", "cache-hit", async () => {
    called += 1;
    return [{ keyword: "one" }];
  });

  const cacheOnlyOptions = resolveSeoOptions("keyword-plan", [
    "--cache-dir",
    tmpDir,
    "--cache-only",
  ]);

  const cached = await withCachedResult(cacheOnlyOptions, "keyword-plan", "cache-hit", async () => {
    called += 1;
    return [{ keyword: "two" }];
  });

  assert.equal(called, 1);
  assert.deepEqual(cached, [{ keyword: "one" }]);
});

test("route coverage includes published guides and excludes drafts", () => {
  const coverage = getStaticRouteCoverage();

  for (const guide of getPublishedGuides()) {
    assert.ok(coverage.htmlRoutes.includes(`/guides/${guide.slug}`));
  }

  assert.ok(!coverage.htmlRoutes.includes("/guides/draft-guide-example"));
});

test("route coverage includes about page", () => {
  const coverage = getStaticRouteCoverage();

  assert.ok(coverage.htmlRoutes.includes("/about"));
});

test("about metadata is covered", () => {
  const metadata = getMetadataSnapshotForRoute("/about");

  assert.equal(metadata?.title, "About Importing Philippines");
  assert.equal(metadata?.alternates?.canonical, "/about");
  assert.equal(
    metadata?.description,
    "Importing Philippines helps importers organize China-to-Philippines shipment requests, receive private forwarder quotes, and compare options in one place.",
  );
});

test("sitemap includes about page", () => {
  const entries = sitemap().map((entry) => entry.url);

  assert.ok(entries.includes("https://importing.ph/about"));
});

test("public headers include about link", async () => {
  const header = await fs.readFile(
    path.join(process.cwd(), "components/public/site-header.tsx"),
    "utf8",
  );
  const home = await fs.readFile(path.join(process.cwd(), "app/page.tsx"), "utf8");

  assert.match(header, /href="\/about"/);
  assert.match(home, /href="\/about"/);
});

test("markdown alternates are covered", () => {
  const targets = getAuditTargets().filter((target) => target.kind === "html");
  const guideTargets = targets.filter((target) => target.path.startsWith("/guides/") && target.path !== "/guides");

  for (const target of guideTargets) {
    assert.ok(target.expectedMarkdownAlternate);
  }
});

test("unsupported developer copy checks work", () => {
  assert.equal(hasDeveloperFacingCopy("TODO clean this up"), true);
  assert.equal(hasDeveloperFacingCopy("Beginner guide for importers"), false);
});

test("mock provider returns deterministic route suggestions", async () => {
  const provider = createMockSeoProvider();
  const result = await provider.getKeywordPlan({
    keywords: ["CBM shipping Philippines"],
    market: "ph",
  });

  assert.equal(result[0]?.suggestedRoute, "/guides/what-is-cbm");
});
