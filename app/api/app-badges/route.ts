import { NextResponse } from "next/server";

import { getAppBadgeStateForCurrentUser } from "@/lib/app-badges";

export async function GET() {
  const badgeState = await getAppBadgeStateForCurrentUser();

  return NextResponse.json(badgeState, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
