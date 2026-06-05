import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { getPublishedGuideMarkdown } from "@/features/public-content/ai-readable/registry";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { buildGuideMetadata, buildGuidesIndexMetadata } from "@/features/public-content/seo/metadata";
import {
  buildGuideArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
} from "@/features/public-content/seo/jsonLd";
import {
  getPublishedGuideBySlug,
  getPublishedGuides,
  getSiteUrl,
} from "@/features/public-content/seo/routes";
import {
  type AuditRouteTarget,
  type ResolvedSeoOptions,
  type SeoCommand,
  type SeoProvider,
  type SeoProviderName,
  getAuditTargets,
  hasDeveloperFacingCopy,
} from "@/scripts/seo/config";
import { createDataForSeoProvider } from "@/scripts/seo/providers/dataforseo";
import { createMockSeoProvider } from "@/scripts/seo/providers/mock";

export type RouteAuditResult = {
  errors: string[];
  path: string;
  passed: boolean;
  warnings: string[];
};

type CacheRecord<T> = {
  createdAt: string;
  data: T;
};

export function createSeoProvider(options: ResolvedSeoOptions): SeoProvider {
  switch (options.provider) {
    case "mock":
      return createMockSeoProvider();
    case "dataforseo":
      return createDataForSeoProvider(options);
  }
}

export async function withCachedResult<T>(
  options: ResolvedSeoOptions,
  command: SeoCommand,
  key: string,
  producer: () => Promise<T>,
) {
  const filePath = getCacheFilePath(options.cacheDir, command, key);

  if (options.cacheOnly) {
    const cached = await readCache<T>(filePath);
    if (!cached) {
      throw new Error(`No cached ${command} result for key ${key}.`);
    }

    return cached.data;
  }

  const cached = await readCache<T>(filePath);
  if (cached) {
    return cached.data;
  }

  const data = await producer();
  await writeCache(filePath, { createdAt: new Date().toISOString(), data });
  return data;
}

function getCacheFilePath(cacheDir: string, command: SeoCommand, key: string) {
  return path.join(cacheDir, command, `${sanitizeCacheKey(key)}.json`);
}

function sanitizeCacheKey(input: string) {
  const normalized = input.replace(/[^a-z0-9._-]+/gi, "_").toLowerCase().slice(0, 80);
  const digest = crypto.createHash("sha1").update(input).digest("hex").slice(0, 12);
  return `${normalized}_${digest}`;
}

async function readCache<T>(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as CacheRecord<T>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function writeCache<T>(filePath: string, payload: CacheRecord<T>) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
}

export function buildAuditReport(results: RouteAuditResult[]) {
  const failed = results.filter((result) => !result.passed);
  const warnings = results.flatMap((result) =>
    result.warnings.map((warning) => `${result.path}: ${warning}`),
  );

  return {
    failed,
    passed: failed.length === 0,
    warnings,
  };
}

export async function auditRenderedRoutes(baseUrl: string, targets = getAuditTargets()) {
  const results: RouteAuditResult[] = [];

  for (const target of targets) {
    results.push(await auditSingleRoute(baseUrl, target));
  }

  results.push(auditSitemap());
  results.push(auditRobots());

  return results;
}

async function auditSingleRoute(baseUrl: string, target: AuditRouteTarget): Promise<RouteAuditResult> {
  if (target.kind === "markdown") {
    return auditMarkdownRoute(baseUrl, target);
  }

  return auditHtmlRoute(baseUrl, target);
}

function countTag(html: string, tagName: string) {
  const matches = html.match(new RegExp(`<${tagName}\\b`, "gi"));
  return matches?.length ?? 0;
}

function readMetaContent(html: string, matcher: RegExp) {
  const match = html.match(matcher);
  return match?.[1] ?? null;
}

function readLinkHref(html: string, matcher: RegExp) {
  const match = html.match(matcher);
  return match?.[1] ?? null;
}

function readJsonLdBlocks(html: string) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .map((block) => {
      try {
        return JSON.parse(block) as { "@type"?: string };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<{ "@type"?: string }>;
}

function normalizeUrlForComparison(input: string) {
  return input.endsWith("/") ? input.slice(0, -1) : input;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function auditHtmlRoute(baseUrl: string, target: AuditRouteTarget): Promise<RouteAuditResult> {
  const url = new URL(target.path, baseUrl).toString();
  const response = await fetch(url);
  const html = await response.text();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response.ok) {
    return {
      errors: [`HTTP ${response.status}`],
      path: target.path,
      passed: false,
      warnings,
    };
  }

  const title = readMetaContent(html, /<title>([^<]+)<\/title>/i);
  const description = readMetaContent(
    html,
    /<meta[^>]+name="description"[^>]+content="([^"]+)"/i,
  );
  const canonical = readLinkHref(
    html,
    /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i,
  );
  const ogTitle = readMetaContent(
    html,
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
  );
  const twitterTitle = readMetaContent(
    html,
    /<meta[^>]+name="twitter:title"[^>]+content="([^"]+)"/i,
  );
  const markdownAlternate = readLinkHref(
    html,
    /<link[^>]+rel="alternate"[^>]+type="text\/markdown"[^>]+href="([^"]+)"/i,
  );

  if (!title) {
    errors.push("Missing title");
  }

  if (!description) {
    errors.push("Missing description");
  }

  if (!canonical) {
    errors.push("Missing canonical");
  } else if (
    target.canonicalPath &&
    normalizeUrlForComparison(canonical) !==
      normalizeUrlForComparison(getSiteUrl(target.canonicalPath))
  ) {
    errors.push(`Canonical mismatch: ${canonical}`);
  }

  if (!ogTitle) {
    errors.push("Missing OpenGraph title");
  }

  if (!twitterTitle) {
    errors.push("Missing Twitter title");
  }

  if (target.expectsH1 && countTag(html, "h1") !== 1) {
    errors.push(`Expected one H1, found ${countTag(html, "h1")}`);
  }

  const jsonLdBlocks = readJsonLdBlocks(html);
  if (target.expectsArticleJsonLd && !jsonLdBlocks.some((block) => block["@type"] === "Article")) {
    errors.push("Missing Article JSON-LD");
  }

  if (
    target.expectsBreadcrumbJsonLd &&
    !jsonLdBlocks.some((block) => block["@type"] === "BreadcrumbList")
  ) {
    errors.push("Missing BreadcrumbList JSON-LD");
  }

  if (target.expectedMarkdownAlternate) {
    const expected = getSiteUrl(target.expectedMarkdownAlternate);
    if (markdownAlternate !== expected) {
      errors.push(`Missing markdown alternate ${expected}`);
    }
  }

  if (hasDeveloperFacingCopy(stripHtml(html))) {
    errors.push("Developer-facing copy leakage detected");
  }

  return {
    errors,
    path: target.path,
    passed: errors.length === 0,
    warnings,
  };
}

async function auditMarkdownRoute(
  baseUrl: string,
  target: AuditRouteTarget,
): Promise<RouteAuditResult> {
  const response = await fetch(new URL(target.path, baseUrl));
  const contentType = response.headers.get("content-type");
  const body = await response.text();
  const markdown = getPublishedGuideMarkdown(
    target.path.replace(/^\/guides\//, "").replace(/\/markdown$/, ""),
  );

  const errors: string[] = [];

  if (!response.ok) {
    errors.push(`HTTP ${response.status}`);
  }

  if (!contentType?.includes("text/markdown")) {
    errors.push(`Expected text/markdown content-type, got ${contentType ?? "missing"}`);
  }

  if (!markdown) {
    errors.push("Missing generated markdown");
  } else if (body !== markdown) {
    errors.push("Rendered markdown drifted from typed guide source");
  } else if (hasDeveloperFacingCopy(markdown)) {
    errors.push("Developer-facing copy leakage detected");
  }

  return {
    errors,
    path: target.path,
    passed: errors.length === 0,
    warnings: [],
  };
}

function auditSitemap(): RouteAuditResult {
  const entries = sitemap().map((entry) => entry.url);
  const errors: string[] = [];

  for (const guide of getPublishedGuides()) {
    const url = getSiteUrl(`/guides/${guide.slug}`);
    if (!entries.includes(url)) {
      errors.push(`Missing sitemap route ${url}`);
    }
  }

  if (entries.includes(getSiteUrl("/guides/draft-guide-example"))) {
    errors.push("Draft guide leaked into sitemap");
  }

  return {
    errors,
    path: "/sitemap.xml",
    passed: errors.length === 0,
    warnings: [],
  };
}

function auditRobots(): RouteAuditResult {
  const robotsConfig = robots();
  const errors: string[] = [];
  const ruleList = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules
    : [robotsConfig.rules];

  for (const rule of ruleList) {
    if (!rule) {
      continue;
    }

    if (rule.userAgent === "*" && typeof rule.disallow === "string" && rule.disallow.includes("/guides")) {
      errors.push("robots.txt blocks guide routes");
    }
  }

  return {
    errors,
    path: "/robots.txt",
    passed: errors.length === 0,
    warnings: [],
  };
}

export function getStaticRouteCoverage() {
  const targets = getAuditTargets();

  return {
    routes: targets.map((target) => target.path),
    htmlRoutes: targets.filter((target) => target.kind === "html").map((target) => target.path),
    markdownRoutes: targets.filter((target) => target.kind === "markdown").map((target) => target.path),
  };
}

export function getMetadataSnapshotForRoute(pathname: string) {
  if (pathname === "/guides") {
    return buildGuidesIndexMetadata();
  }

  if (pathname.startsWith("/guides/") && !pathname.endsWith("/markdown")) {
    const slug = pathname.replace(/^\/guides\//, "");
    const guide = getPublishedGuideBySlug(slug);

    if (!guide) {
      return null;
    }

    return buildGuideMetadata(guide);
  }

  return null;
}

export function getJsonLdSnapshotForRoute(pathname: string) {
  if (!pathname.startsWith("/guides/") || pathname.endsWith("/markdown")) {
    return [];
  }

  const slug = pathname.replace(/^\/guides\//, "");
  const guide = getPublishedGuideBySlug(slug);

  if (!guide) {
    return [];
  }

  return [buildGuideArticleJsonLd(guide), buildGuideBreadcrumbJsonLd(guide)];
}

export function formatReport(results: RouteAuditResult[]) {
  return results
    .map((result) => {
      const status = result.passed ? "PASS" : "FAIL";
      const detail = [...result.errors, ...result.warnings].join("; ");
      return detail ? `${status} ${result.path} - ${detail}` : `${status} ${result.path}`;
    })
    .join("\n");
}

export function resolveProviderName(input: string | undefined): SeoProviderName {
  return input === "dataforseo" ? "dataforseo" : "mock";
}
