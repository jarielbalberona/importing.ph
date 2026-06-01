import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  importerProfiles,
  shipmentRequests,
  shippingPreferenceEnum,
  type UserRole,
} from "@/db/schema";
import { requireRole } from "@/lib/authz";

const optionalDecimal = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .regex(/^\d+(\.\d+)?$/, "Must be a positive number")
      .optional(),
  );

const optionalInteger = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().regex(/^\d+$/, "Must be a positive whole number").optional());

export const createShipmentRequestSchema = z
  .object({
    cargoDescription: z.string().trim().min(3).max(240),
    cargoType: z.enum(cargoTypeEnum.enumValues),
    totalCbm: optionalDecimal,
    totalWeightKg: optionalDecimal,
    packageCount: optionalInteger,
    lengthCm: optionalDecimal,
    widthCm: optionalDecimal,
    heightCm: optionalDecimal,
    declaredValue: optionalDecimal,
    origin: z.string().trim().min(2).max(160),
    destination: z.string().trim().min(2).max(160),
    deliveryPreference: z.enum(deliveryPreferenceEnum.enumValues),
    shippingPreference: z.enum(shippingPreferenceEnum.enumValues),
    notes: z.string().trim().max(1000).optional(),
    attachmentNotes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (input) =>
      Boolean(input.totalCbm) ||
      Boolean(input.totalWeightKg) ||
      Boolean(
        input.lengthCm &&
          input.widthCm &&
          input.heightCm &&
          input.packageCount,
      ),
    {
      message:
        "Provide total CBM, total weight, or dimensions plus package count.",
      path: ["totalCbm"],
    },
  );

export type CreateShipmentRequestInput = z.infer<
  typeof createShipmentRequestSchema
>;

export function shipmentRequestInputFromFormData(formData: FormData) {
  return {
    cargoDescription: formData.get("cargoDescription"),
    cargoType: formData.get("cargoType"),
    totalCbm: formData.get("totalCbm"),
    totalWeightKg: formData.get("totalWeightKg"),
    packageCount: formData.get("packageCount"),
    lengthCm: formData.get("lengthCm"),
    widthCm: formData.get("widthCm"),
    heightCm: formData.get("heightCm"),
    declaredValue: formData.get("declaredValue"),
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    deliveryPreference: formData.get("deliveryPreference"),
    shippingPreference: formData.get("shippingPreference"),
    notes: formData.get("notes"),
    attachmentNotes: formData.get("attachmentNotes"),
  };
}

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
    .select()
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
