import { auditRenderedRoutes, buildAuditReport, formatReport } from "@/scripts/seo/lib";
import { resolveSeoOptions } from "@/scripts/seo/config";

async function main() {
  const options = resolveSeoOptions("audit", process.argv.slice(2));
  const results = await auditRenderedRoutes(options.baseUrl);
  const report = buildAuditReport(results);

  console.log(`SEO audit target: ${options.baseUrl}`);
  console.log(formatReport(results));

  console.log(
    `\nSummary: ${results.length - report.failed.length} passed, ${report.failed.length} failed.`,
  );

  if (!report.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
