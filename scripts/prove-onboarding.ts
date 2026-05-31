import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { closeDb, db } from "@/db";
import {
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  userProfiles,
} from "@/db/schema";
import { createOnboardingProfile } from "@/lib/onboarding";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run onboarding proof in production");
}

const suffix = `${Date.now()}`;
const importerClerkUserId = `dev_importer_${suffix}`;
const forwarderClerkUserId = `dev_forwarder_${suffix}`;

async function requireRow<T>(row: T | undefined, label: string) {
  if (!row) {
    throw new Error(`${label} was not created`);
  }

  return row;
}

async function main() {
  const importerResult = await createOnboardingProfile(importerClerkUserId, {
    role: "importer",
    fullName: "Dev Importer",
    companyName: "Dev Importer Co",
  });

  const importerProfile = await requireRow(
    await db.query.importerProfiles.findFirst({
      where: eq(importerProfiles.userProfileId, importerResult.profile.id),
    }),
    "importer_profile",
  );

  const forwarderResult = await createOnboardingProfile(forwarderClerkUserId, {
    role: "forwarder",
    fullName: "Dev Forwarder",
    companyName: "Dev Forwarder Co",
  });

  const forwarderMember = await requireRow(
    await db.query.forwarderMembers.findFirst({
      where: eq(forwarderMembers.userProfileId, forwarderResult.profile.id),
    }),
    "forwarder_member",
  );

  await requireRow(
    await db.query.forwarderCompanies.findFirst({
      where: eq(forwarderCompanies.id, forwarderMember.forwarderCompanyId),
    }),
    "forwarder_company",
  );

  console.log("Onboarding proof PASS");
  console.log(
    JSON.stringify(
      {
        importer: {
          userProfileId: importerResult.profile.id,
          importerProfileId: importerProfile.id,
        },
        forwarder: {
          userProfileId: forwarderResult.profile.id,
          forwarderCompanyId: forwarderMember.forwarderCompanyId,
          forwarderMemberId: forwarderMember.id,
        },
      },
      null,
      2,
    ),
  );

  await db
    .delete(userProfiles)
    .where(eq(userProfiles.clerkUserId, importerClerkUserId));
  await db
    .delete(userProfiles)
    .where(eq(userProfiles.clerkUserId, forwarderClerkUserId));
}

main()
  .catch((error) => {
    console.error("Onboarding proof FAIL");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
