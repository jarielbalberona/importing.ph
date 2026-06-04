import { createHmac, timingSafeEqual } from "node:crypto";

import type { UserRole } from "@/db/schema";

const tokenTtlMs = 60_000;

export type RealtimeTokenPayload = {
  version: 1;
  clerkUserId: string;
  userProfileId: string;
  role: UserRole;
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.REALTIME_TOKEN_SECRET || process.env.CLERK_SECRET_KEY;

  if (!secret) {
    throw new Error("REALTIME_TOKEN_SECRET or CLERK_SECRET_KEY is required");
  }

  return secret;
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createRealtimeToken(input: {
  clerkUserId: string;
  userProfileId: string;
  role: UserRole;
}) {
  const payload: RealtimeTokenPayload = {
    version: 1,
    clerkUserId: input.clerkUserId,
    userProfileId: input.userProfileId,
    role: input.role,
    expiresAt: Date.now() + tokenTtlMs,
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: payload.expiresAt,
  };
}

export function verifyRealtimeToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return undefined;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return undefined;
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as RealtimeTokenPayload;

  if (
    payload.version !== 1 ||
    !payload.clerkUserId ||
    !payload.userProfileId ||
    !payload.role ||
    payload.expiresAt <= Date.now()
  ) {
    return undefined;
  }

  return payload;
}
