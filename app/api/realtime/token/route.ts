import { NextResponse } from "next/server";

import { apiError, rateLimitResponse } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile } from "@/lib/api-authz";
import {
  consumeRateLimit,
  RateLimitError,
  rateLimitPolicies,
} from "@/lib/rate-limit";
import { createRealtimeToken } from "@/lib/realtime-token";

export async function POST() {
  try {
    const profile = await requireApiProfile();
    await consumeRateLimit(rateLimitPolicies.realtimeToken, profile.id);
    const token = createRealtimeToken({
      clerkUserId: profile.clerkUserId,
      userProfileId: profile.id,
      role: profile.role,
    });

    return NextResponse.json(token, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Authentication is required.");
    }
    if (error instanceof RateLimitError) {
      return rateLimitResponse(error);
    }
    throw error;
  }
}
