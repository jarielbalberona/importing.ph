import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { forwarderCompanies, importerProfiles, userProfiles, type UserRole } from "@/db/schema";

export type PublicForwarderCompanyProfile = {
  slug: string;
  name: string;
  shippingModes: string | null;
  originCities: string | null;
  destinationAreas: string | null;
  serviceDescription: string | null;
  createdAt: Date;
};

export type AuthenticatedImporterProfile = {
  slug: string;
  companyName: string;
  displayName: string;
  createdAt: Date;
};

export type ImporterProfileViewer = {
  userProfileId: string;
  role: UserRole;
};

type ForwarderProfileRow = {
  slug: string | null;
  name: string;
  shippingModes: string | null;
  originCities: string | null;
  destinationAreas: string | null;
  serviceDescription: string | null;
  createdAt: Date;
  isSuspended: boolean;
};

type ImporterProfileRow = {
  slug: string | null;
  companyName: string;
  fullName: string;
  createdAt: Date;
};

async function loadForwarderProfileRowBySlug(slug: string) {
  const [row] = await db
    .select({
      slug: forwarderCompanies.slug,
      name: forwarderCompanies.name,
      shippingModes: forwarderCompanies.shippingModes,
      originCities: forwarderCompanies.originCities,
      destinationAreas: forwarderCompanies.destinationAreas,
      serviceDescription: forwarderCompanies.serviceDescription,
      createdAt: forwarderCompanies.createdAt,
      isSuspended: forwarderCompanies.isSuspended,
    })
    .from(forwarderCompanies)
    .where(eq(forwarderCompanies.slug, slug))
    .limit(1);

  return row satisfies ForwarderProfileRow | undefined;
}

async function loadImporterProfileRowBySlug(slug: string) {
  const [row] = await db
    .select({
      slug: importerProfiles.slug,
      companyName: importerProfiles.companyName,
      fullName: userProfiles.fullName,
      createdAt: importerProfiles.createdAt,
    })
    .from(importerProfiles)
    .innerJoin(userProfiles, eq(importerProfiles.userProfileId, userProfiles.id))
    .where(and(eq(importerProfiles.slug, slug), eq(userProfiles.role, "importer")))
    .limit(1);

  return row satisfies ImporterProfileRow | undefined;
}

export class ImporterProfileAuthError extends Error {
  constructor() {
    super("authenticated viewer required");
  }
}

function mapForwarderProfileRow(
  row: ForwarderProfileRow | undefined,
): PublicForwarderCompanyProfile | null {
  if (!row || row.isSuspended || !row.slug) {
    return null;
  }

  return {
    slug: row.slug,
    name: row.name,
    shippingModes: row.shippingModes,
    originCities: row.originCities,
    destinationAreas: row.destinationAreas,
    serviceDescription: row.serviceDescription,
    createdAt: row.createdAt,
  };
}

function mapImporterProfileRow(
  row: ImporterProfileRow | undefined,
): AuthenticatedImporterProfile | null {
  if (!row || !row.slug) {
    return null;
  }

  return {
    slug: row.slug,
    companyName: row.companyName,
    displayName: row.companyName || row.fullName,
    createdAt: row.createdAt,
  };
}

// Privacy contract for future /forwarder/[company-slug] pages:
// public-safe company data only, no staff/member personal data, suspended companies hidden.
export async function getForwarderCompanyProfileBySlug(
  slug: string,
  loadRow: (slug: string) => Promise<ForwarderProfileRow | undefined> = loadForwarderProfileRowBySlug,
) {
  return mapForwarderProfileRow(await loadRow(slug));
}

// Privacy contract for future importer profile pages:
// authenticated-only, noindex when page is added, and no email/phone/shipment details by default.
// Forwarder access should later be gated by an existing request/conversation relationship.
export async function getImporterProfileBySlug(
  slug: string,
  viewer: ImporterProfileViewer | null | undefined,
  loadRow: (slug: string) => Promise<ImporterProfileRow | undefined> = loadImporterProfileRowBySlug,
) {
  if (!viewer) {
    throw new ImporterProfileAuthError();
  }

  return mapImporterProfileRow(await loadRow(slug));
}
