import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import postgres from "postgres";

import * as schema from "./schema";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

declare global {
  var postgresClient: postgres.Sql | undefined;
  var drizzleDatabase: ReturnType<typeof createDatabase> | undefined;
}

function boundedInteger(value: string | undefined, fallback: number, maximum: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
}

export function getClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  globalThis.postgresClient ??= postgres(connectionString, {
    max: boundedInteger(process.env.DATABASE_POOL_MAX, 5, 20),
    connect_timeout: boundedInteger(
      process.env.DATABASE_CONNECT_TIMEOUT_SECONDS,
      10,
      60,
    ),
    idle_timeout: boundedInteger(
      process.env.DATABASE_IDLE_TIMEOUT_SECONDS,
      20,
      300,
    ),
    prepare: false,
  });

  return globalThis.postgresClient;
}

function createDatabase() {
  return drizzle(getClient(), { schema });
}

export type Database = ReturnType<typeof createDatabase>;

export function getDb() {
  globalThis.drizzleDatabase ??= createDatabase();
  return globalThis.drizzleDatabase;
}

export const db = new Proxy({} as Database, {
  get(_target, property) {
    const database = getDb();
    const value = Reflect.get(database, property, database) as unknown;
    return typeof value === "function" ? value.bind(database) : value;
  },
});

export async function closeDb() {
  await globalThis.postgresClient?.end({ timeout: 1 });
  globalThis.postgresClient = undefined;
  globalThis.drizzleDatabase = undefined;
}
