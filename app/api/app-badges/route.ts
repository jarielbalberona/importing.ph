import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile } from "@/lib/api-authz";
import { getAppBadgeStateForProfile } from "@/lib/app-badges";

export async function GET() {
  try {
    const profile = await requireApiProfile();
    const badgeState = await getAppBadgeStateForProfile(profile);

    return NextResponse.json(badgeState, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Authentication is required.");
    }
    throw error;
  }
}
