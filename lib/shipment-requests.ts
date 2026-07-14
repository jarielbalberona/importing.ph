import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  importerProfiles,
  quotes,
  shipmentRequests,
  type ShipmentRequestStatus,
  type UserRole,
} from "@/db/schema";
import { attachFilesToShipmentRequest } from "@/lib/media";
import { notifyShipmentRequestPosted } from "@/lib/notifications";
import { requireRole } from "@/lib/authz";
import { runBestEffort } from "@/lib/best-effort";
import { formatDestination } from "@/lib/format";
import { consumeRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
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
  options: { status?: Extract<ShipmentRequestStatus, "draft" | "posted"> } = {},
) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.requestMutation, profile.id);
  const parsed = createShipmentRequestSchema.parse(input);
  const status = options.status ?? "posted";
  const destinationDisplayName =
    parsed.destinationDisplayName ||
    formatDestination({
      destination: parsed.destination,
      destinationDisplayName: parsed.destinationDisplayName,
      destinationProvinceName: parsed.destinationProvinceName,
      destinationCityMunicipalityName: parsed.destinationCityMunicipalityName,
      destinationBarangayName: parsed.destinationBarangayName,
      destinationAddressDetails: parsed.destinationAddressDetails,
    });

  const request = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(shipmentRequests)
      .values({
        importerProfileId: importerProfile.id,
        status,
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
        destination: destinationDisplayName,
        destinationRegionCode: parsed.destinationRegionCode || undefined,
        destinationRegionName: parsed.destinationRegionName || undefined,
        destinationProvinceCode: parsed.destinationProvinceCode,
        destinationProvinceName: parsed.destinationProvinceName,
        destinationCityMunicipalityCode: parsed.destinationCityMunicipalityCode,
        destinationCityMunicipalityName: parsed.destinationCityMunicipalityName,
        destinationBarangayCode: parsed.destinationBarangayCode || undefined,
        destinationBarangayName: parsed.destinationBarangayName || undefined,
        destinationAddressDetails: parsed.destinationAddressDetails || undefined,
        destinationDisplayName,
        deliveryPreference: parsed.deliveryPreference,
        shippingModePreference: parsed.shippingModePreference,
        shippingPreference: parsed.shippingPreference,
        notes: parsed.notes || undefined,
        attachmentNotes: parsed.attachmentNotes || undefined,
      })
      .returning({ id: shipmentRequests.id });

    await attachFilesToShipmentRequest(tx, {
      shipmentRequestId: created.id,
      importerProfileId: importerProfile.id,
      ownerUserProfileId: profile.id,
      fileIds: parsed.attachmentFileIds,
    });

    return created;
  });

  if (status === "posted") {
    await runBestEffort(
      "notification.request_posted_failed",
      () =>
        notifyShipmentRequestPosted({
          requestId: request.id,
          actorUserProfileId: profile.id,
        }),
      { requestId: request.id },
    );
  }

  return request;
}

export async function publishShipmentRequestForCurrentImporter(requestId: string) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.requestMutation, profile.id);
  const now = new Date();

  const [request] = await db
    .update(shipmentRequests)
    .set({ status: "posted", updatedAt: now })
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.importerProfileId, importerProfile.id),
        eq(shipmentRequests.status, "draft"),
      ),
    )
    .returning({ id: shipmentRequests.id });

  if (request) {
    await runBestEffort(
      "notification.request_posted_failed",
      () =>
        notifyShipmentRequestPosted({
          requestId: request.id,
          actorUserProfileId: profile.id,
        }),
      { requestId: request.id },
    );
  }

  return request;
}

export async function getShipmentRequestsForCurrentImporter() {
  const { importerProfile } = await requireImporterProfile();
  const quoteCounts = db
    .select({
      shipmentRequestId: quotes.shipmentRequestId,
      quoteCount: sql<number>`cast(count(*) as int)`.as("quote_count"),
    })
    .from(quotes)
    .groupBy(quotes.shipmentRequestId)
    .as("quote_counts");

  return db
    .select({
      ...getTableColumns(shipmentRequests),
      quoteCount: sql<number>`coalesce(${quoteCounts.quoteCount}, 0)`,
    })
    .from(shipmentRequests)
    .leftJoin(
      quoteCounts,
      eq(quoteCounts.shipmentRequestId, shipmentRequests.id),
    )
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
