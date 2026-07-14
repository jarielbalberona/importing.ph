import { sql } from "drizzle-orm";

import { closeDb, db } from "../db";
import { logServerError } from "../lib/server-log";

async function main() {
  const duplicates = await db.execute<{
    shipment_request_id: string;
    accepted_quote_count: number;
  }>(sql`
    SELECT
      shipment_request_id,
      count(*)::int AS accepted_quote_count
    FROM quotes
    WHERE status::text = 'accepted'
    GROUP BY shipment_request_id
    HAVING count(*) > 1
    ORDER BY shipment_request_id
  `);

  if (duplicates.length > 0) {
    console.error(
      JSON.stringify({
        status: "blocked",
        reason: "duplicate_accepted_quotes",
        requests: duplicates,
      }),
    );
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({ status: "ready", duplicateRequestCount: 0 }));
}

main()
  .catch((error) => {
    logServerError("database.v1_hardening_preflight_failed", error);
    process.exitCode = 1;
  })
  .finally(closeDb);
