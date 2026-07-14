import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { type UserRole, userProfiles } from "@/db/schema";

export class ApiAuthError extends Error {
  constructor(
    readonly status: 401 | 403,
    readonly code: "unauthenticated" | "forbidden",
  ) {
    super(code);
    this.name = "ApiAuthError";
  }
}

export async function requireApiProfile() {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiAuthError(401, "unauthenticated");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkUserId, userId),
  });
  if (!profile) {
    throw new ApiAuthError(403, "forbidden");
  }

  return profile;
}

export async function requireApiRole(allowedRoles: UserRole[]) {
  const profile = await requireApiProfile();
  if (!allowedRoles.includes(profile.role)) {
    throw new ApiAuthError(403, "forbidden");
  }
  return profile;
}
