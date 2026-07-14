import { config } from "dotenv";
import postgres from "postgres";
import WebSocket from "ws";

import { createRealtimeToken } from "../lib/realtime-token";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run realtime smoke in production");
}

const realtimeUrl =
  process.env.REALTIME_SMOKE_URL || "ws://127.0.0.1:5001/api/realtime/ws";
const sql = postgres(databaseUrl, { max: 1, prepare: false });
const clerkUserId = `realtime_smoke_${Date.now()}`;

async function main() {
  const [profile] = await sql<{
    id: string;
    clerk_user_id: string;
    role: "importer";
  }[]>`
    INSERT INTO user_profiles (clerk_user_id, role, full_name)
    VALUES (${clerkUserId}, 'importer', 'Realtime Smoke')
    RETURNING id, clerk_user_id, role
  `;

  try {
    const token = createRealtimeToken({
      clerkUserId: profile.clerk_user_id,
      userProfileId: profile.id,
      role: profile.role,
    });
    await connectOnce(token.token);
    await connectOnce(token.token);
    console.log("Realtime reconnect smoke PASS");
  } finally {
    await sql`DELETE FROM user_profiles WHERE clerk_user_id = ${clerkUserId}`;
  }
}

function connectOnce(token: string) {
  return new Promise<void>((resolve, reject) => {
    const url = new URL(realtimeUrl);
    url.searchParams.set("token", token);
    const socket = new WebSocket(url);
    const timeout = setTimeout(() => {
      socket.terminate();
      reject(new Error("Realtime connection timed out"));
    }, 5_000);

    socket.on("message", (raw) => {
      const event = JSON.parse(raw.toString()) as { type?: string };
      if (event.type === "realtime.connected") {
        clearTimeout(timeout);
        socket.close(1000, "smoke complete");
        resolve();
      }
    });
    socket.on("unexpected-response", (_request, response) => {
      clearTimeout(timeout);
      reject(new Error(`Realtime upgrade failed with ${response.statusCode}`));
    });
    socket.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

main()
  .catch((error) => {
    console.error("Realtime reconnect smoke FAIL", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 1 });
  });
