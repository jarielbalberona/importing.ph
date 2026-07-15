import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  type ForwarderMemberRole,
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  userProfiles,
} from "@/db/schema";
import {
  defaultForwarderSlugFallback,
  defaultImporterSlugFallback,
  generateUniqueSlug,
  getForwarderCompanySlugSource,
  getImporterProfileSlugSource,
} from "@/lib/slug";

const sharedOnboardingFields = {
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "Full name must be 120 characters or fewer."),
  companyName: z
    .string()
    .trim()
    .min(2, "Enter your company name.")
    .max(160, "Company name must be 160 characters or fewer."),
} as const;

export const onboardingSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("importer"),
    ...sharedOnboardingFields,
  }),
  z.object({
    role: z.literal("forwarder"),
    ...sharedOnboardingFields,
    shippingModes: z.enum(["sea", "air", "both"], {
      error: "Choose the shipping modes your company supports.",
    }),
    originCities: z
      .string()
      .trim()
      .min(2, "Add at least one China origin city.")
      .max(500),
    destinationAreas: z
      .string()
      .trim()
      .min(2, "Add at least one Philippine destination area.")
      .max(500),
    serviceDescription: z
      .string()
      .trim()
      .min(20, "Describe your forwarding service in at least 20 characters.")
      .max(1000),
  }),
]);

type OnboardingInput = z.infer<typeof onboardingSchema>;

export const defaultForwarderMemberRole: ForwarderMemberRole = "owner";

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
    const isForwarderSlugUnique = async (slug: string) => {
      const existing = await tx.query.forwarderCompanies.findFirst({
        where: eq(forwarderCompanies.slug, slug),
      });

      return !existing;
    };

    const isImporterSlugUnique = async (slug: string) => {
      const existing = await tx.query.importerProfiles.findFirst({
        where: eq(importerProfiles.slug, slug),
      });

      return !existing;
    };

    const [profile] = await tx
      .insert(userProfiles)
      .values({
        clerkUserId,
        fullName: parsed.fullName,
        role: parsed.role,
      })
      .returning();

    if (parsed.role === "importer") {
      const importerSlug = await generateUniqueSlug(
        getImporterProfileSlugSource({
          companyName: parsed.companyName,
          fullName: parsed.fullName,
        }),
        {
          fallback: defaultImporterSlugFallback,
          isUnique: isImporterSlugUnique,
        },
      );

      const [importerProfile] = await tx
        .insert(importerProfiles)
        .values({
          userProfileId: profile.id,
          slug: importerSlug,
          companyName: parsed.companyName,
        })
        .returning();

      return { profile, importerProfile };
    }

    const forwarderSlug = await generateUniqueSlug(
      getForwarderCompanySlugSource(parsed.companyName),
      {
        fallback: defaultForwarderSlugFallback,
        isUnique: isForwarderSlugUnique,
      },
    );

    const [forwarderCompany] = await tx
      .insert(forwarderCompanies)
      .values({
        name: parsed.companyName,
        slug: forwarderSlug,
        shippingModes: parsed.shippingModes,
        originCities: parsed.originCities,
        destinationAreas: parsed.destinationAreas,
        serviceDescription: parsed.serviceDescription,
      })
      .returning();

    const [forwarderMember] = await tx
      .insert(forwarderMembers)
      .values({
        userProfileId: profile.id,
        forwarderCompanyId: forwarderCompany.id,
        memberRole: defaultForwarderMemberRole,
      })
      .returning();

    return { profile, forwarderCompany, forwarderMember };
  });

  return { ...result, created: true };
}
