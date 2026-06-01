import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  importerProfiles,
  quotes,
  shipmentRequests,
  type UserRole,
} from "@/db/schema";
import { requireRole } from "@/lib/authz";
import {
  createShipmentRequestSchema,
  type CreateShipmentRequestInput,
} from "@/lib/validation";

export async function requireImporterProfile() {
  const profile = await requireRole(["importer"] satisfies UserRole[]);

  const importerProfile = await db.query.importerProfiles.findFirst({
    where: eq(importerProfiles.userProfileId, profile.id),
  });

  if (!importerProfile) {
    throw new Error("Importer profile is missing for the current user.");
  }

  return { profile, importerProfile };
}

export async function createShipmentRequestForCurrentImporter(
  input: CreateShipmentRequestInput,
) {
  const { importerProfile } = await requireImporterProfile();
  const parsed = createShipmentRequestSchema.parse(input);

  const [request] = await db
    .insert(shipmentRequests)
    .values({
      importerProfileId: importerProfile.id,
      status: "posted",
      cargoDescription: parsed.cargoDescription,
      cargoType: parsed.cargoType,
      totalCbm: parsed.totalCbm,
      totalWeightKg: parsed.totalWeightKg,
      packageCount: parsed.packageCount
        ? Number.parseInt(parsed.packageCount, 10)
        : undefined,
      lengthCm: parsed.lengthCm,
      widthCm: parsed.widthCm,
      heightCm: parsed.heightCm,
      declaredValue: parsed.declaredValue,
      origin: parsed.origin,
      destination: parsed.destination,
      deliveryPreference: parsed.deliveryPreference,
      shippingPreference: parsed.shippingPreference,
      notes: parsed.notes || undefined,
      attachmentNotes: parsed.attachmentNotes || undefined,
    })
    .returning({ id: shipmentRequests.id });

  return request;
}

export async function getShipmentRequestsForCurrentImporter() {
  const { importerProfile } = await requireImporterProfile();

  return db
    .select({
      ...getTableColumns(shipmentRequests),
      quoteCount: sql<number>`cast((select count(*) from ${quotes} where ${quotes.shipmentRequestId} = ${shipmentRequests.id}) as int)`,
    })
    .from(shipmentRequests)
    .where(eq(shipmentRequests.importerProfileId, importerProfile.id))
    .orderBy(desc(shipmentRequests.createdAt));
}

export async function getShipmentRequestForCurrentImporter(requestId: string) {
  const { importerProfile } = await requireImporterProfile();

  const [request] = await db
    .select()
    .from(shipmentRequests)
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.importerProfileId, importerProfile.id),
      ),
    )
    .limit(1);

  return request;
}
