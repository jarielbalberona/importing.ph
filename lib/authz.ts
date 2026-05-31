import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { type UserRole, userProfiles } from "@/db/schema";
import { destinationForRole } from "@/lib/routes";

export async function getProfileForCurrentUser() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkUserId, userId),
  });

  return { profile, userId };
}

export async function requireProfile() {
  const { profile } = await getProfileForCurrentUser();

  if (!profile) {
    redirect("/onboarding");
  }

  return profile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role)) {
    redirect(destinationForRole(profile.role));
  }

  return profile;
}
