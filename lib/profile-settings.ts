import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  forwarderCompanies,
  forwarderQuoteDefaults,
  importerProfiles,
  userProfiles,
} from "@/db/schema";
import { requireForwarderMember } from "@/lib/forwarder-open-requests";
import { requireImporterProfile } from "@/lib/shipment-requests";
import {
  forwarderCompanySettingsSchema,
  importerProfileSettingsSchema,
} from "@/lib/validation";

export class ForwarderCompanySettingsAccessError extends Error {
  constructor(readonly code: "forbidden" | "suspended") {
    super(code === "forbidden" ? "Forbidden" : "Suspended");
  }
}

export async function getImporterSettingsForCurrentUser() {
  const { profile, importerProfile } = await requireImporterProfile();

  return { profile, importerProfile };
}

export async function updateImporterSettingsForCurrentUser(
  input: unknown,
) {
  const { profile, importerProfile } = await requireImporterProfile();
  const parsed = importerProfileSettingsSchema.parse(input);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(userProfiles)
      .set({ fullName: parsed.fullName, updatedAt: now })
      .where(eq(userProfiles.id, profile.id));

    await tx
      .update(importerProfiles)
      .set({
        companyName: parsed.companyName,
        location: parsed.location ?? null,
        contactPhone: parsed.contactPhone ?? null,
        updatedAt: now,
      })
      .where(eq(importerProfiles.id, importerProfile.id));
  });
}

export async function getForwarderSettingsForCurrentUser() {
  const { member } = await requireForwarderMember();

  const [company] = await db
    .select()
    .from(forwarderCompanies)
    .where(eq(forwarderCompanies.id, member.companyId))
    .limit(1);

  if (!company) {
    throw new Error("Forwarder company is missing for the current user.");
  }

  const [quoteDefaults] = await db
    .select()
    .from(forwarderQuoteDefaults)
    .where(eq(forwarderQuoteDefaults.forwarderCompanyId, member.companyId))
    .limit(1);

  return { company, member, quoteDefaults };
}

export async function updateForwarderSettingsForCurrentUser(
  input: unknown,
) {
  const { member } = await requireForwarderMember();
  const parsed = forwarderCompanySettingsSchema.parse(input);
  const now = new Date();

  if (member.memberRole !== "owner" && member.memberRole !== "admin") {
    throw new ForwarderCompanySettingsAccessError("forbidden");
  }

  if (member.companyIsSuspended) {
    throw new ForwarderCompanySettingsAccessError("suspended");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(forwarderCompanies)
      .set({
        name: parsed.companyName,
        contactPerson: parsed.contactPerson ?? null,
        contactEmail: parsed.contactEmail ?? null,
        originCities: parsed.originCities ?? null,
        destinationAreas: parsed.destinationAreas ?? null,
        shippingModes: parsed.shippingModes,
        serviceDescription: parsed.serviceDescription ?? null,
        updatedAt: now,
      })
      .where(eq(forwarderCompanies.id, member.companyId));

    await tx
      .insert(forwarderQuoteDefaults)
      .values({
        forwarderCompanyId: member.companyId,
        currency: parsed.defaultCurrency,
        serviceOffered: parsed.defaultServiceOffered ?? null,
        transitMinDays: parsed.defaultTransitMinDays
          ? Number.parseInt(parsed.defaultTransitMinDays, 10)
          : null,
        transitMaxDays: parsed.defaultTransitMaxDays
          ? Number.parseInt(parsed.defaultTransitMaxDays, 10)
          : null,
        inclusions: parsed.defaultInclusions ?? null,
        exclusions: parsed.defaultExclusions ?? null,
        notes: parsed.defaultNotes ?? null,
        validForDays: parsed.defaultValidForDays
          ? Number.parseInt(parsed.defaultValidForDays, 10)
          : null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: forwarderQuoteDefaults.forwarderCompanyId,
        set: {
          currency: parsed.defaultCurrency,
          serviceOffered: parsed.defaultServiceOffered ?? null,
          transitMinDays: parsed.defaultTransitMinDays
            ? Number.parseInt(parsed.defaultTransitMinDays, 10)
            : null,
          transitMaxDays: parsed.defaultTransitMaxDays
            ? Number.parseInt(parsed.defaultTransitMaxDays, 10)
            : null,
          inclusions: parsed.defaultInclusions ?? null,
          exclusions: parsed.defaultExclusions ?? null,
          notes: parsed.defaultNotes ?? null,
          validForDays: parsed.defaultValidForDays
            ? Number.parseInt(parsed.defaultValidForDays, 10)
            : null,
          updatedAt: now,
        },
      });
  });
}

export async function getForwarderQuoteDefaultsForCurrentCompany(
  forwarderCompanyId: string,
) {
  const [quoteDefaults] = await db
    .select()
    .from(forwarderQuoteDefaults)
    .where(eq(forwarderQuoteDefaults.forwarderCompanyId, forwarderCompanyId))
    .limit(1);

  return quoteDefaults;
}

export function defaultValidUntilFromDays(days: number | null) {
  if (!days || days < 1) {
    return undefined;
  }

  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}
