import { createSeoProvider, withCachedResult } from "@/scripts/seo/lib";
import { resolveSeoOptions } from "@/scripts/seo/config";

async function main() {
  const options = resolveSeoOptions("serp-rank", process.argv.slice(2));
  const provider = createSeoProvider(options);
  const cacheKey = `${options.provider}-${options.market}-${options.domain}-${options.keywords.join("|")}`;

  const result = await withCachedResult(options, "serp-rank", cacheKey, () =>
    provider.getSerpRanks({
      keywords: options.keywords,
      market: options.market,
      domain: options.domain,
    }),
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
