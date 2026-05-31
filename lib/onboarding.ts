import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  userProfiles,
} from "@/db/schema";

export const onboardingSchema = z.object({
  role: z.enum(["importer", "forwarder"]),
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(160),
});

type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function createOnboardingProfile(
  clerkUserId: string,
  input: OnboardingInput,
) {
  const parsed = onboardingSchema.parse(input);

  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkUserId, clerkUserId),
  });

  if (existingProfile) {
    return { profile: existingProfile, created: false };
  }

  const result = await db.transaction(async (tx) => {
    const [profile] = await tx
      .insert(userProfiles)
      .values({
        clerkUserId,
        fullName: parsed.fullName,
        role: parsed.role,
      })
      .returning();

    if (parsed.role === "importer") {
      const [importerProfile] = await tx
        .insert(importerProfiles)
        .values({
          userProfileId: profile.id,
          companyName: parsed.companyName,
        })
        .returning();

      return { profile, importerProfile };
    }

    const [forwarderCompany] = await tx
      .insert(forwarderCompanies)
      .values({
        name: parsed.companyName,
      })
      .returning();

    const [forwarderMember] = await tx
      .insert(forwarderMembers)
      .values({
        userProfileId: profile.id,
        forwarderCompanyId: forwarderCompany.id,
        memberRole: "owner",
      })
      .returning();

    return { profile, forwarderCompany, forwarderMember };
  });

  return { ...result, created: true };
}
