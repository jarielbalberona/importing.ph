import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { createRealtimeToken } from "@/lib/realtime-token";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkUserId, userId),
  });

  if (!profile) {
    return NextResponse.json({ error: "profile_required" }, { status: 403 });
  }

  const token = createRealtimeToken({
    clerkUserId: userId,
    userProfileId: profile.id,
    role: profile.role,
  });

  return NextResponse.json(token, {
    headers: { "Cache-Control": "no-store" },
  });
}
