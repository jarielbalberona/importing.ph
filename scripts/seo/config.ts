import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPublishedGuideMarkdown } from "@/features/public-content/ai-readable/registry";
import { getPublishedGuides, getGuideMarkdownPath, getGuidePath, siteOrigin } from "@/features/public-content/seo/routes";

export type SeoProviderName = "mock" | "dataforseo";
export type SeoMarket = "ph" | "ph_mobile";
export type SeoCommand = "verify" | "audit" | "keyword-plan" | "serp-rank";

export type KeywordPlanResult = {
  keyword: string;
  market: SeoMarket;
  intent: "informational" | "commercial" | "mixed";
  difficulty: "low" | "medium" | "high";
  suggestedRoute: string | null;
};

export type SerpRankResult = {
  keyword: string;
  market: SeoMarket;
  domain: string;
  found: boolean;
  rank: number | null;
  url: string | null;
  checkedAt: string;
  provider: SeoProviderName;
};

export type KeywordProviderInput = {
  keywords: string[];
  market: SeoMarket;
};

export type SerpProviderInput = {
  keywords: string[];
  market: SeoMarket;
  domain: string;
};

export type SeoProvider = {
  getKeywordPlan(input: KeywordProviderInput): Promise<KeywordPlanResult[]>;
  getSerpRanks(input: SerpProviderInput): Promise<SerpRankResult[]>;
};

export type AuditRouteTarget = {
  kind: "html" | "markdown";
  label: string;
  path: string;
  canonicalPath?: string;
  expectsArticleJsonLd?: boolean;
  expectsBreadcrumbJsonLd?: boolean;
  expectsH1?: boolean;
  expectedMarkdownAlternate?: string | null;
};

export type ResolvedSeoOptions = {
  allowOverLimit: boolean;
  baseUrl: string;
  cacheDir: string;
  cacheOnly: boolean;
  command: SeoCommand;
  confirmLive: boolean;
  domain: string;
  hardLimit: number;
  keywords: string[];
  market: SeoMarket;
  provider: SeoProviderName;
  softLimit: number;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seoWorkspaceRoot = path.resolve(__dirname, "..", "..");
export const seoCacheDir = path.join(seoWorkspaceRoot, ".cache", "seo-workbench");
export const defaultBaseUrl = "http://localhost:3000";
export const defaultDomain = new URL(siteOrigin).hostname;

export const seedKeywords = [
  "import from China to Philippines",
  "China to Philippines forwarder",
  "shipping quote Philippines",
  "CBM shipping Philippines",
  "air cargo China to Philippines",
  "sea cargo China to Philippines",
  "cargo forwarder Philippines",
  "how to import products from China",
] as const;

export const defaultMarkets: readonly SeoMarket[] = ["ph", "ph_mobile"];

export const developerCopyPatterns = [
  "lorem ipsum",
  "todo",
  "fixme",
  "developer note",
  "placeholder copy",
  "sample content",
  "dummy content",
  "test only",
  "internal draft",
  "mvp",
  "schema",
  "source of truth",
  "v1",
  "workflow engine",
] as const;

export function getAuditTargets(): AuditRouteTarget[] {
  const guideTargets = getPublishedGuides().flatMap((guide) => {
    const guidePath = getGuidePath(guide.slug);
    const markdownPath = getGuideMarkdownPath(guide.slug);

    return [
      {
        kind: "html" as const,
        label: guide.slug,
        path: guidePath,
        canonicalPath: guidePath,
        expectsArticleJsonLd: true,
        expectsBreadcrumbJsonLd: true,
        expectsH1: true,
        expectedMarkdownAlternate: markdownPath,
      },
      {
        kind: "markdown" as const,
        label: `${guide.slug}.md`,
        path: markdownPath,
        canonicalPath: guidePath,
      },
    ];
  });

  return [
    {
      kind: "html",
      label: "home",
      path: "/",
      canonicalPath: "/",
      expectsH1: true,
    },
    {
      kind: "html",
      label: "guides",
      path: "/guides",
      canonicalPath: "/guides",
      expectsH1: true,
    },
    {
      kind: "html",
      label: "about",
      path: "/about",
      canonicalPath: "/about",
      expectsH1: true,
    },
    ...guideTargets,
  ];
}

function parseKeywordArg(value: string | undefined) {
  if (!value) {
    return [...seedKeywords];
  }

  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function readFlag(argv: string[], name: string) {
  return argv.includes(name);
}

function readOption(argv: string[], name: string) {
  const index = argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return argv[index + 1];
}

export function resolveSeoOptions(command: SeoCommand, argv: string[]): ResolvedSeoOptions {
  const provider = (readOption(argv, "--provider") ??
    process.env.LOCAL_SEO_PROVIDER ??
    "mock") as SeoProviderName;
  const market = (readOption(argv, "--market") ?? "ph") as SeoMarket;
  const keywords = parseKeywordArg(readOption(argv, "--keywords"));
  const baseUrl = readOption(argv, "--base-url") ?? process.env.LOCAL_SEO_BASE_URL ?? defaultBaseUrl;
  const domain = readOption(argv, "--domain") ?? defaultDomain;
  const cacheDir = readOption(argv, "--cache-dir") ?? seoCacheDir;
  const confirmLive = readFlag(argv, "--confirm-live");
  const cacheOnly = readFlag(argv, "--cache-only");
  const allowOverLimit = readFlag(argv, "--allow-over-limit");

  const softLimit = command === "keyword-plan" ? 20 : 5;
  const hardLimit = command === "keyword-plan" ? 50 : 10;

  if (command === "keyword-plan" || command === "serp-rank") {
    validateKeywordLimit(keywords.length, softLimit, hardLimit, allowOverLimit, command);
  }

  return {
    allowOverLimit,
    baseUrl,
    cacheDir,
    cacheOnly,
    command,
    confirmLive,
    domain,
    hardLimit,
    keywords,
    market,
    provider,
    softLimit,
  };
}

export function validateKeywordLimit(
  count: number,
  softLimit: number,
  hardLimit: number,
  allowOverLimit: boolean,
  command: SeoCommand,
) {
  if (count > hardLimit) {
    throw new Error(
      `${command} keyword count ${count} exceeds hard limit ${hardLimit}. Reduce scope.`,
    );
  }

  if (count > softLimit && !allowOverLimit) {
    throw new Error(
      `${command} keyword count ${count} exceeds soft limit ${softLimit}. Re-run with --allow-over-limit if you really mean it.`,
    );
  }
}

export function getRouteCoverage() {
  const targets = getAuditTargets();

  return {
    htmlRoutes: targets.filter((target) => target.kind === "html"),
    markdownRoutes: targets.filter((target) => target.kind === "markdown"),
  };
}

export function hasDeveloperFacingCopy(text: string) {
  const normalized = text.toLowerCase();

  return developerCopyPatterns.some((pattern) => normalized.includes(pattern));
}

export function isPublishedMarkdownRoute(pathname: string) {
  const slug = pathname
    .replace(/^\/guides\//, "")
    .replace(/\/markdown$/, "");

  return getPublishedGuideMarkdown(slug) !== null;
}
