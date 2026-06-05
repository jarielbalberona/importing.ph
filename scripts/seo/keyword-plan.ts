import { createSeoProvider, withCachedResult } from "@/scripts/seo/lib";
import { resolveSeoOptions } from "@/scripts/seo/config";

async function main() {
  const options = resolveSeoOptions("keyword-plan", process.argv.slice(2));
  const provider = createSeoProvider(options);
  const cacheKey = `${options.provider}-${options.market}-${options.keywords.join("|")}`;

  const result = await withCachedResult(options, "keyword-plan", cacheKey, () =>
    provider.getKeywordPlan({
      keywords: options.keywords,
      market: options.market,
    }),
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
