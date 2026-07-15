import { createHmac } from "node:crypto";

import { sql } from "drizzle-orm";

import { db, type Database } from "@/db";

export const rateLimitPolicies = {
  requestMutation: { scope: "request_mutation", limit: 10, windowSeconds: 600 },
  quoteMutation: { scope: "quote_mutation", limit: 30, windowSeconds: 300 },
  messageSend: { scope: "message_send", limit: 60, windowSeconds: 60 },
  attachmentUpload: { scope: "attachment_upload", limit: 10, windowSeconds: 600 },
  attachmentDownload: { scope: "attachment_download", limit: 60, windowSeconds: 60 },
  realtimeToken: { scope: "realtime_token", limit: 30, windowSeconds: 60 },
  locationLookup: { scope: "location_lookup", limit: 120, windowSeconds: 60 },
  funnelEntry: { scope: "funnel_entry", limit: 30, windowSeconds: 60 },
} as const;

export type RateLimitPolicy = {
  scope: (typeof rateLimitPolicies)[keyof typeof rateLimitPolicies]["scope"];
  limit: number;
  windowSeconds: number;
};

export class RateLimitError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super("rate_limited");
    this.name = "RateLimitError";
  }
}

function getHashSecret() {
  const secret = process.env.RATE_LIMIT_HASH_SECRET || process.env.CLERK_SECRET_KEY;
  if (!secret) {
    throw new Error("RATE_LIMIT_HASH_SECRET or CLERK_SECRET_KEY is required");
  }
  return secret;
}

export function hashRateLimitSubject(subject: string) {
  return createHmac("sha256", getHashSecret())
    .update(subject.trim().toLowerCase())
    .digest("hex");
}

export async function consumeRateLimit(
  policy: RateLimitPolicy,
  subject: string,
  now = new Date(),
  database: Pick<Database, "execute"> = db,
) {
  const subjectHash = hashRateLimitSubject(subject);
  const windowMilliseconds = policy.windowSeconds * 1_000;
  const cutoff = new Date(now.getTime() - windowMilliseconds);
  const nowIso = now.toISOString();
  const cutoffIso = cutoff.toISOString();

  const rows = await database.execute<{
    request_count: number;
    window_started_at: Date;
  }>(sql`
    INSERT INTO rate_limit_states (
      scope,
      subject_hash,
      window_started_at,
      request_count,
      updated_at
    ) VALUES (
      ${policy.scope},
      ${subjectHash},
      ${nowIso}::timestamptz,
      1,
      ${nowIso}::timestamptz
    )
    ON CONFLICT (scope, subject_hash) DO UPDATE SET
      window_started_at = CASE
        WHEN rate_limit_states.window_started_at <= ${cutoffIso}::timestamptz
          THEN ${nowIso}::timestamptz
        ELSE rate_limit_states.window_started_at
      END,
      request_count = CASE
        WHEN rate_limit_states.window_started_at <= ${cutoffIso}::timestamptz
          THEN 1
        ELSE rate_limit_states.request_count + 1
      END,
      updated_at = ${nowIso}::timestamptz
    RETURNING request_count, window_started_at
  `);

  const state = rows[0];
  if (!state) {
    throw new Error("Rate limit state was not returned");
  }

  const count = Number(state.request_count);
  const windowStartedAt = new Date(state.window_started_at);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(
      (windowStartedAt.getTime() + windowMilliseconds - now.getTime()) / 1_000,
    ),
  );

  if (count > policy.limit) {
    throw new RateLimitError(retryAfterSeconds);
  }

  return {
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    retryAfterSeconds,
  };
}
