import type {
  KeywordPlanResult,
  KeywordProviderInput,
  SeoProvider,
  SerpProviderInput,
  SerpRankResult,
} from "@/scripts/seo/config";

const routeHints = [
  { match: /cbm/i, path: "/guides/what-is-cbm" },
  { match: /air cargo|sea cargo/i, path: "/guides/air-cargo-vs-sea-cargo" },
  { match: /forwarder/i, path: "/guides/list-of-forwarders-china-to-philippines" },
  { match: /shipping quote|quote/i, path: "/guides/how-to-request-a-shipping-quote" },
  { match: /import/i, path: "/guides/how-to-import-from-china-to-philippines" },
];

function pickRoute(keyword: string) {
  return routeHints.find((hint) => hint.match.test(keyword))?.path ?? null;
}

function estimateDifficulty(keyword: string): KeywordPlanResult["difficulty"] {
  if (/forwarder|cargo/i.test(keyword)) {
    return "high";
  }

  if (/quote|import/i.test(keyword)) {
    return "medium";
  }

  return "low";
}

function estimateIntent(keyword: string): KeywordPlanResult["intent"] {
  if (/what is|how to/i.test(keyword)) {
    return "informational";
  }

  if (/forwarder|quote/i.test(keyword)) {
    return "commercial";
  }

  return "mixed";
}

export function createMockSeoProvider(): SeoProvider {
  return {
    async getKeywordPlan(input: KeywordProviderInput) {
      return input.keywords.map((keyword) => ({
        keyword,
        market: input.market,
        intent: estimateIntent(keyword),
        difficulty: estimateDifficulty(keyword),
        suggestedRoute: pickRoute(keyword),
      }));
    },
    async getSerpRanks(input: SerpProviderInput): Promise<SerpRankResult[]> {
      return input.keywords.map((keyword, index) => ({
        keyword,
        market: input.market,
        domain: input.domain,
        found: true,
        rank: index + 1,
        url: pickRoute(keyword),
        checkedAt: new Date("2026-06-05T00:00:00.000Z").toISOString(),
        provider: "mock",
      }));
    },
  };
}
