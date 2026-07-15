import { lt } from "drizzle-orm";

import { closeDb, db } from "../db";
import { funnelEvents } from "../db/schema";

const retentionDays = 90;
const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

try {
  const deleted = await db
    .delete(funnelEvents)
    .where(lt(funnelEvents.createdAt, cutoff))
    .returning({ id: funnelEvents.id });

  console.log(
    JSON.stringify({
      deleted: deleted.length,
      cutoff: cutoff.toISOString(),
      retentionDays,
    }),
  );
} finally {
  await closeDb();
}
