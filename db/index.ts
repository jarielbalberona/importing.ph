import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import postgres from "postgres";

import * as schema from "./schema";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

declare global {
  var postgresClient: postgres.Sql | undefined;
}

function getClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  globalThis.postgresClient ??= postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  return globalThis.postgresClient;
}

export const db = drizzle(getClient(), { schema });

export async function closeDb() {
  await globalThis.postgresClient?.end({ timeout: 1 });
  globalThis.postgresClient = undefined;
}
