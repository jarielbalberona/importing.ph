import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const requiredTables = [
  "user_profiles",
  "importer_profiles",
  "forwarder_companies",
  "forwarder_members",
];

const sql = postgres(databaseUrl, { max: 1, prepare: false });

async function main() {
  try {
    const [connection] =
      await sql`select current_database() as database, current_user as user`;

    const tableRows = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ${sql(requiredTables)}
    `;

    const foundTables = new Set(tableRows.map((row) => row.table_name));
    const missingTables = requiredTables.filter(
      (table) => !foundTables.has(table),
    );

    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(", ")}`);
    }

    console.log("DB smoke PASS");
    console.log(`database=${connection.database}`);
    console.log(`user=${connection.user}`);
    console.log(`tables=${requiredTables.join(",")}`);
  } finally {
    await sql.end({ timeout: 1 });
  }
}

main().catch((error) => {
  console.error("DB smoke FAIL");
  console.error(error);
  process.exit(1);
});
