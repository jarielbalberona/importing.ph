import { z } from "zod";

import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  shippingPreferenceEnum,
} from "@/db/schema";

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

const optionalPositiveInteger = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .regex(/^[1-9]\d*$/, "Must be a positive whole number")
      .optional(),
  );

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

function stringFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : undefined;
}

export function shipmentRequestInputFromFormData(formData: FormData) {
  return {
    cargoDescription: stringFormValue(formData, "cargoDescription"),
    cargoType: stringFormValue(formData, "cargoType"),
    totalCbm: stringFormValue(formData, "totalCbm"),
    totalWeightKg: stringFormValue(formData, "totalWeightKg"),
    packageCount: stringFormValue(formData, "packageCount"),
    lengthCm: stringFormValue(formData, "lengthCm"),
    widthCm: stringFormValue(formData, "widthCm"),
    heightCm: stringFormValue(formData, "heightCm"),
    declaredValue: stringFormValue(formData, "declaredValue"),
    origin: stringFormValue(formData, "origin"),
    destination: stringFormValue(formData, "destination"),
    deliveryPreference: stringFormValue(formData, "deliveryPreference"),
    shippingPreference: stringFormValue(formData, "shippingPreference"),
    notes: stringFormValue(formData, "notes"),
    attachmentNotes: stringFormValue(formData, "attachmentNotes"),
  };
}

const optionalLongText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => value || undefined);

export function dateFromDateInput(value: string) {
  return new Date(`${value}T00:00:00`);
}

const dateInputString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

export const quoteSubmissionSchema = z
  .object({
    quoteAmount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount."),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .default("PHP")
      .pipe(z.literal("PHP")),
    serviceOffered: z.string().trim().min(3).max(240),
    estimatedTransitMinDays: z.coerce.number().int().min(1).max(365),
    estimatedTransitMaxDays: z.coerce.number().int().min(1).max(365),
    inclusions: z.string().trim().min(1).max(2000),
    exclusions: z.string().trim().min(1).max(2000),
    notes: optionalLongText,
    validUntil: dateInputString,
  })
  .refine(
    (input) =>
      input.estimatedTransitMaxDays >= input.estimatedTransitMinDays,
    {
      message: "Maximum transit days must be greater than or equal to minimum.",
      path: ["estimatedTransitMaxDays"],
    },
  )
  .refine((input) => dateFromDateInput(input.validUntil).getTime() > Date.now(), {
    message: "Quote validity must be in the future.",
    path: ["validUntil"],
  });

export type QuoteSubmissionInput = z.infer<typeof quoteSubmissionSchema>;

export function quoteSubmissionInputFromFormData(formData: FormData) {
  return {
    quoteAmount: stringFormValue(formData, "quoteAmount"),
    currency: stringFormValue(formData, "currency") || "PHP",
    serviceOffered: stringFormValue(formData, "serviceOffered"),
    estimatedTransitMinDays: stringFormValue(
      formData,
      "estimatedTransitMinDays",
    ),
    estimatedTransitMaxDays: stringFormValue(
      formData,
      "estimatedTransitMaxDays",
    ),
    inclusions: stringFormValue(formData, "inclusions"),
    exclusions: stringFormValue(formData, "exclusions"),
    notes: stringFormValue(formData, "notes"),
    validUntil: stringFormValue(formData, "validUntil"),
  };
}

const optionalProfileText = (max = 240) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

export const importerProfileSettingsSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(160),
  location: optionalProfileText(160),
  contactPhone: optionalProfileText(80),
});

export type ImporterProfileSettingsInput = z.infer<
  typeof importerProfileSettingsSchema
>;

export function importerProfileSettingsInputFromFormData(formData: FormData) {
  return {
    fullName: stringFormValue(formData, "fullName"),
    companyName: stringFormValue(formData, "companyName"),
    location: stringFormValue(formData, "location"),
    contactPhone: stringFormValue(formData, "contactPhone"),
  };
}

export const forwarderCompanySettingsSchema = z
  .object({
    companyName: z.string().trim().min(2).max(160),
    contactPerson: optionalProfileText(120),
    contactEmail: optionalProfileText(160).pipe(
      z.string().email("Enter a valid email address.").optional(),
    ),
    originCities: optionalProfileText(500),
    destinationAreas: optionalProfileText(500),
    shippingModes: z.enum(["sea", "air", "both"]),
    serviceDescription: optionalProfileText(1000),
    defaultCurrency: z.string().trim().toUpperCase().default("PHP").pipe(z.literal("PHP")),
    defaultServiceOffered: optionalProfileText(240),
    defaultTransitMinDays: optionalPositiveInteger,
    defaultTransitMaxDays: optionalPositiveInteger,
    defaultInclusions: optionalProfileText(2000),
    defaultExclusions: optionalProfileText(2000),
    defaultNotes: optionalProfileText(2000),
    defaultValidForDays: optionalPositiveInteger,
  })
  .refine(
    (input) => {
      if (!input.defaultTransitMinDays || !input.defaultTransitMaxDays) {
        return true;
      }

      return (
        Number.parseInt(input.defaultTransitMaxDays, 10) >=
        Number.parseInt(input.defaultTransitMinDays, 10)
      );
    },
    {
      message: "Maximum transit days must be greater than or equal to minimum.",
      path: ["defaultTransitMaxDays"],
    },
  );

export type ForwarderCompanySettingsInput = z.infer<
  typeof forwarderCompanySettingsSchema
>;

export function forwarderCompanySettingsInputFromFormData(formData: FormData) {
  return {
    companyName: stringFormValue(formData, "companyName"),
    contactPerson: stringFormValue(formData, "contactPerson"),
    contactEmail: stringFormValue(formData, "contactEmail"),
    originCities: stringFormValue(formData, "originCities"),
    destinationAreas: stringFormValue(formData, "destinationAreas"),
    shippingModes: stringFormValue(formData, "shippingModes"),
    serviceDescription: stringFormValue(formData, "serviceDescription"),
    defaultCurrency: stringFormValue(formData, "defaultCurrency") || "PHP",
    defaultServiceOffered: stringFormValue(formData, "defaultServiceOffered"),
    defaultTransitMinDays: stringFormValue(formData, "defaultTransitMinDays"),
    defaultTransitMaxDays: stringFormValue(formData, "defaultTransitMaxDays"),
    defaultInclusions: stringFormValue(formData, "defaultInclusions"),
    defaultExclusions: stringFormValue(formData, "defaultExclusions"),
    defaultNotes: stringFormValue(formData, "defaultNotes"),
    defaultValidForDays: stringFormValue(formData, "defaultValidForDays"),
  };
}
