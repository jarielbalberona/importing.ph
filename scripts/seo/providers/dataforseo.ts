import type {
  ResolvedSeoOptions,
  SeoProvider,
  SerpProviderInput,
  KeywordProviderInput,
} from "@/scripts/seo/config";

type DataForSeoCredentials = {
  login: string;
  password: string;
};

export function requireDataForSeoCredentials(env: NodeJS.ProcessEnv = process.env): DataForSeoCredentials {
  const login = env.DATAFORSEO_LOGIN;
  const password = env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are required for provider=dataforseo.");
  }

  return { login, password };
}

export function redactSecrets(input: string, env: NodeJS.ProcessEnv = process.env) {
  let output = input;

  for (const secret of [env.DATAFORSEO_LOGIN, env.DATAFORSEO_PASSWORD]) {
    if (!secret) {
      continue;
    }

    output = output.replaceAll(secret, "[REDACTED]");
  }

  return output;
}

export function shouldExecuteLiveDataForSeo(options: Pick<ResolvedSeoOptions, "provider" | "confirmLive">) {
  return options.provider === "dataforseo" && options.confirmLive;
}

async function runDataForSeoRequest<T>(
  options: ResolvedSeoOptions,
  path: string,
  payload: unknown,
) {
  const credentials = requireDataForSeoCredentials();

  if (!shouldExecuteLiveDataForSeo(options)) {
    return {
      dryRun: true,
      endpoint: path,
      payload,
    } as T;
  }

  try {
    const response = await fetch(`https://api.dataforseo.com${path}`, {
      method: "POST",
      headers: {
        "authorization": `Basic ${Buffer.from(`${credentials.login}:${credentials.password}`).toString("base64")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO HTTP ${response.status}: ${await response.text()}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    const message = error instanceof Error ? redactSecrets(error.message) : "Unknown DataForSEO error";
    throw new Error(message);
  }
}

export function createDataForSeoProvider(options: ResolvedSeoOptions): SeoProvider {
  return {
    async getKeywordPlan(input: KeywordProviderInput) {
      await runDataForSeoRequest(options, "/v3/dataforseo_labs/google/keyword_ideas/live", {
        location_name: "Philippines",
        language_name: "English",
        keywords: input.keywords,
      });

      return input.keywords.map((keyword) => ({
        keyword,
        market: input.market,
        intent: "mixed" as const,
        difficulty: "medium" as const,
        suggestedRoute: null,
      }));
    },
    async getSerpRanks(input: SerpProviderInput) {
      await runDataForSeoRequest(options, "/v3/serp/google/organic/live/advanced", {
        location_name: "Philippines",
        language_name: "English",
        keyword: input.keywords[0],
        target: input.domain,
      });

      return input.keywords.map((keyword) => ({
        keyword,
        market: input.market,
        domain: input.domain,
        found: false,
        rank: null,
        url: null,
        checkedAt: new Date().toISOString(),
        provider: "dataforseo" as const,
      }));
    },
  };
}
