import { z } from "zod";

import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  quoteShippingModeEnum,
  shippingModePreferenceEnum,
  type ShippingModePreference,
  shippingPreferenceEnum,
} from "@/db/schema";
import { shipmentAttachmentMaxCount } from "@/lib/file-rules";

export const otherChinaOriginValue = "Other, China";

function optionalPositiveDecimal(message: string) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(
      z
        .string()
        .refine((value) => /^\d+(\.\d+)?$/.test(value) && Number(value) > 0, {
          message,
        })
        .optional(),
    );
}

const optionalPackageCount = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .regex(/^[1-9]\d*$/, "Enter a valid package count greater than 0.")
      .optional(),
  );

const optionalPositiveInteger = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .regex(/^[1-9]\d*$/, "Enter a valid number greater than 0.")
      .optional(),
  );

export type ShipmentSizeField =
  | "totalCbm"
  | "totalWeightKg"
  | "packageCount"
  | "lengthCm"
  | "widthCm"
  | "heightCm";

type ShipmentSizeInput = Partial<Record<ShipmentSizeField, unknown>>;

export function getShipmentSizeStepErrors(input: ShipmentSizeInput) {
  const errors: Partial<Record<ShipmentSizeField, string>> = {};
  const hasTotalCbm = Boolean(input.totalCbm);
  const hasPackageCount = Boolean(input.packageCount);
  const hasLength = Boolean(input.lengthCm);
  const hasWidth = Boolean(input.widthCm);
  const hasHeight = Boolean(input.heightCm);
  const hasAnyDimension = hasLength || hasWidth || hasHeight;
  const hasAnyDimensionSignal = hasAnyDimension || hasPackageCount;
  const hasCompleteDimensions = hasLength && hasWidth && hasHeight;

  if (!input.totalWeightKg) {
    errors.totalWeightKg = "Enter the total gross weight.";
  }

  if (hasTotalCbm) {
    return errors;
  }

  if (!hasAnyDimensionSignal) {
    errors.totalCbm =
      "Provide either total CBM or complete package dimensions with package count.";
    return errors;
  }

  if (!hasCompleteDimensions) {
    const message = "Complete length, width, and height, or use total CBM instead.";
    errors.lengthCm = message;
    errors.widthCm = message;
    errors.heightCm = message;
  }

  if (!hasPackageCount) {
    errors.packageCount = "Package/carton count is required when using dimensions.";
  }

  return errors;
}

const requiredText = (requiredMessage: string, maxMessage: string) =>
  z
    .string({
      error: requiredMessage,
    })
    .trim()
    .min(1, requiredMessage)
    .max(160, maxMessage);

const cargoTypeSchema = z.enum(cargoTypeEnum.enumValues, {
  error: (issue) =>
    issue.input === undefined
      ? "Choose the closest cargo type."
      : "Choose a valid cargo type from the list.",
});

const deliveryPreferenceSchema = z.enum(deliveryPreferenceEnum.enumValues, {
  error: (issue) =>
    issue.input === undefined
      ? "Choose how you want the cargo delivered."
      : "Choose a valid delivery preference from the list.",
});

const shippingPreferenceSchema = z.enum(shippingPreferenceEnum.enumValues, {
  error: (issue) =>
    issue.input === undefined
      ? "Choose what matters most for this shipment."
      : "Choose a valid shipping preference from the list.",
});

const shippingModePreferenceSchema = z.enum(
  shippingModePreferenceEnum.enumValues,
  {
    error: (issue) =>
      issue.input === undefined
        ? "Choose the preferred shipping mode."
        : "Choose a valid shipping mode preference from the list.",
  },
);

const quoteShippingModeSchema = z.enum(quoteShippingModeEnum.enumValues, {
  error: (issue) =>
    issue.input === undefined
      ? "Choose the shipping mode for this quote."
      : "Choose a valid shipping mode for this quote.",
});

export const createShipmentRequestSchema = z
  .object({
    cargoDescription: z
      .string({
        error: "Add a short description of what you are importing.",
      })
      .trim()
      .min(1, "Add a short description of what you are importing.")
      .min(3, "Use at least 3 characters.")
      .max(240, "Keep the description short and easy to recognize."),
    cargoType: cargoTypeSchema,
    totalCbm: optionalPositiveDecimal("Enter a valid CBM greater than 0."),
    totalWeightKg: optionalPositiveDecimal("Enter a valid weight greater than 0."),
    packageCount: optionalPackageCount,
    lengthCm: optionalPositiveDecimal("Enter a valid measurement greater than 0."),
    widthCm: optionalPositiveDecimal("Enter a valid measurement greater than 0."),
    heightCm: optionalPositiveDecimal("Enter a valid measurement greater than 0."),
    declaredValue: optionalPositiveDecimal(
      "Enter a valid declared value greater than 0.",
    ),
    origin: requiredText(
      "Select the China origin city or area.",
      "Keep the origin concise.",
    ),
    destination: z.string().trim().max(240, "Keep the destination concise.").optional(),
    destinationRegionCode: z
      .string({ error: "Select the destination region." })
      .trim()
      .min(1, "Select the destination region.")
      .max(20),
    destinationRegionName: z
      .string({ error: "Select the destination region." })
      .trim()
      .min(1, "Select the destination region.")
      .max(160),
    destinationProvinceCode: z.string().trim().max(20).optional(),
    destinationProvinceName: z.string().trim().max(160).optional(),
    destinationCityMunicipalityCode: z
      .string({ error: "Select the destination city or municipality." })
      .trim()
      .min(1, "Select the destination city or municipality.")
      .max(20),
    destinationCityMunicipalityName: z
      .string({ error: "Select the destination city or municipality." })
      .trim()
      .min(1, "Select the destination city or municipality.")
      .max(160),
    destinationBarangayCode: z.string().trim().max(20).optional(),
    destinationBarangayName: z.string().trim().max(160).optional(),
    destinationAddressDetails: z
      .string()
      .trim()
      .max(500, "Keep the address note concise.")
      .optional(),
    destinationDisplayName: z
      .string()
      .trim()
      .max(300, "Keep the destination concise.")
      .optional(),
    deliveryPreference: deliveryPreferenceSchema,
    shippingModePreference: shippingModePreferenceSchema,
    shippingPreference: shippingPreferenceSchema,
    notes: z
      .string()
      .trim()
      .max(1000, "Keep notes concise.")
      .optional(),
    attachmentNotes: z
      .string()
      .trim()
      .max(1000, "Keep document notes concise.")
      .optional(),
    attachmentFileIds: z
      .array(z.string().uuid())
      .max(shipmentAttachmentMaxCount)
      .default([]),
  })
  .superRefine((input, context) => {
    const isNcr = input.destinationRegionCode === "1300000000";

    if (isNcr) {
      return;
    }

    if (!input.destinationProvinceCode) {
      context.addIssue({
        code: "custom",
        message: "Select the destination province.",
        path: ["destinationProvinceCode"],
      });
    }

    if (!input.destinationProvinceName) {
      context.addIssue({
        code: "custom",
        message: "Select the destination province.",
        path: ["destinationProvinceName"],
      });
    }
  })
  .superRefine((input, context) => {
    if (input.origin === otherChinaOriginValue) {
      context.addIssue({
        code: "custom",
        message: "Enter the exact pickup city or location in China.",
        path: ["origin"],
      });
    }
  })
  .superRefine((input, context) => {
    for (const [field, message] of Object.entries(
      getShipmentSizeStepErrors(input),
    )) {
      context.addIssue({
        code: "custom",
        message,
        path: [field],
      });
    }
  });

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
    destinationRegionCode: stringFormValue(formData, "destinationRegionCode"),
    destinationRegionName: stringFormValue(formData, "destinationRegionName"),
    destinationProvinceCode: stringFormValue(formData, "destinationProvinceCode"),
    destinationProvinceName: stringFormValue(formData, "destinationProvinceName"),
    destinationCityMunicipalityCode: stringFormValue(
      formData,
      "destinationCityMunicipalityCode",
    ),
    destinationCityMunicipalityName: stringFormValue(
      formData,
      "destinationCityMunicipalityName",
    ),
    destinationBarangayCode: stringFormValue(formData, "destinationBarangayCode"),
    destinationBarangayName: stringFormValue(formData, "destinationBarangayName"),
    destinationAddressDetails: stringFormValue(
      formData,
      "destinationAddressDetails",
    ),
    destinationDisplayName: stringFormValue(formData, "destinationDisplayName"),
    deliveryPreference: stringFormValue(formData, "deliveryPreference"),
    shippingModePreference: stringFormValue(formData, "shippingModePreference"),
    shippingPreference: stringFormValue(formData, "shippingPreference"),
    notes: stringFormValue(formData, "notes"),
    attachmentNotes: stringFormValue(formData, "attachmentNotes"),
    attachmentFileIds: formData
      .getAll("attachmentFileIds")
      .filter((value): value is string => typeof value === "string"),
  };
}

const optionalLongText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => value || undefined);

const requiredPositiveIntegerNumber = (
  requiredMessage: string,
  invalidMessage: string,
) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "string") {
        return Number(value);
      }

      return value;
    },
    z
      .number({
        error: (issue) =>
          issue.input === undefined ? requiredMessage : invalidMessage,
      })
      .int(invalidMessage)
      .min(1, invalidMessage)
      .max(365, invalidMessage),
  );

export function dateFromDateInput(value: string) {
  return new Date(`${value}T00:00:00`);
}

const dateInputString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

function createQuoteSubmissionSchema(
  requestShippingModePreference: ShippingModePreference = "either",
) {
  return z
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
      shippingMode: quoteShippingModeSchema,
      serviceOffered: z.string().trim().min(3).max(240),
      estimatedTransitMinDays: requiredPositiveIntegerNumber(
        "Enter the starting transit estimate.",
        "Enter a valid transit time between 1 and 365 days.",
      ),
      estimatedTransitMaxDays: requiredPositiveIntegerNumber(
        "Enter the ending transit estimate.",
        "Enter a valid transit time between 1 and 365 days.",
      ),
      inclusions: optionalLongText,
      exclusions: optionalLongText,
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
    .refine(
      (input) => dateFromDateInput(input.validUntil).getTime() > Date.now(),
      {
        message: "Quote validity must be in the future.",
        path: ["validUntil"],
      },
    )
    .superRefine((input, context) => {
      if (
        requestShippingModePreference !== "either" &&
        input.shippingMode !== requestShippingModePreference
      ) {
        context.addIssue({
          code: "custom",
          message: `Quote shipping mode must match the importer request: ${requestShippingModePreference === "sea" ? "Sea cargo" : "Air cargo"}.`,
          path: ["shippingMode"],
        });
      }
    });
}

export const quoteSubmissionSchema = createQuoteSubmissionSchema();

export function quoteSubmissionSchemaForRequestMode(
  requestShippingModePreference: ShippingModePreference,
) {
  return createQuoteSubmissionSchema(requestShippingModePreference);
}

export type QuoteSubmissionInput = z.infer<typeof quoteSubmissionSchema>;

export function quoteSubmissionInputFromFormData(formData: FormData) {
  return {
    quoteAmount: stringFormValue(formData, "quoteAmount"),
    currency: stringFormValue(formData, "currency") || "PHP",
    shippingMode: stringFormValue(formData, "shippingMode"),
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
