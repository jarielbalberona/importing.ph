import { and, eq, lt } from "drizzle-orm";

import { closeDb, db } from "../db";
import { mediaFiles } from "../db/schema";
import { deleteR2Object } from "../lib/r2-storage";
import { logServerError } from "../lib/server-log";

const confirmed = process.argv.includes("--confirm");
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1_000);

async function main() {
  const abandoned = await db
    .select({ id: mediaFiles.id, objectKey: mediaFiles.objectKey })
    .from(mediaFiles)
    .where(
      and(
        eq(mediaFiles.context, "shipment_request_attachment"),
        eq(mediaFiles.status, "temporary"),
        lt(mediaFiles.createdAt, cutoff),
      ),
    )
    .orderBy(mediaFiles.createdAt);

  if (!confirmed) {
    console.log(
      JSON.stringify({
        mode: "dry-run",
        cutoff: cutoff.toISOString(),
        candidateCount: abandoned.length,
        candidateIds: abandoned.map((file) => file.id),
        instruction: "Run again with --confirm to delete objects and mark rows deleted.",
      }),
    );
    return;
  }

  let deletedCount = 0;
  for (const file of abandoned) {
    try {
      await deleteR2Object(file.objectKey);
      const [updated] = await db
        .update(mediaFiles)
        .set({ status: "deleted", updatedAt: new Date() })
        .where(
          and(eq(mediaFiles.id, file.id), eq(mediaFiles.status, "temporary")),
        )
        .returning({ id: mediaFiles.id });
      if (updated) deletedCount += 1;
    } catch (error) {
      logServerError("storage.temporary_cleanup_failed", error, {
        fileId: file.id,
      });
    }
  }

  console.log(
    JSON.stringify({
      mode: "confirmed",
      cutoff: cutoff.toISOString(),
      candidateCount: abandoned.length,
      deletedCount,
    }),
  );
}

main()
  .catch((error) => {
    logServerError("storage.temporary_cleanup_command_failed", error);
    process.exitCode = 1;
  })
  .finally(closeDb);
