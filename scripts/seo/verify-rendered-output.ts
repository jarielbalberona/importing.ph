import { auditRenderedRoutes, buildAuditReport, formatReport } from "@/scripts/seo/lib";
import { resolveSeoOptions } from "@/scripts/seo/config";

async function main() {
  const options = resolveSeoOptions("verify", process.argv.slice(2));
  const results = await auditRenderedRoutes(options.baseUrl);
  const report = buildAuditReport(results);

  console.log(formatReport(results));

  if (report.warnings.length) {
    console.log("\nWarnings:");
    for (const warning of report.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (!report.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
