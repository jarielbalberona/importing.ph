import type { z } from "zod";

import type { DestinationSelection } from "@/features/locations/components/LocationPicker";
import { createShipmentRequestSchema, getShipmentSizeStepErrors } from "@/lib/validation";

export type ShipmentRequestFormValues = z.input<typeof createShipmentRequestSchema>;

export type ShipmentRequestStepIndex = 0 | 1 | 2 | 3;

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function buildDestinationDisplayName(value: DestinationSelection) {
  return [
    value.barangayName,
    value.cityMunicipalityName,
    value.provinceName,
    value.provinceName ? undefined : value.regionName,
  ]
    .filter(Boolean)
    .join(", ");
}

export function calculateEstimatedTotalCbm(input: {
  packageCount?: unknown;
  lengthCm?: unknown;
  widthCm?: unknown;
  heightCm?: unknown;
}) {
  const packageCount = Number(input.packageCount);
  const lengthCm = Number(input.lengthCm);
  const widthCm = Number(input.widthCm);
  const heightCm = Number(input.heightCm);

  if (
    !Number.isFinite(packageCount) ||
    !Number.isFinite(lengthCm) ||
    !Number.isFinite(widthCm) ||
    !Number.isFinite(heightCm) ||
    packageCount <= 0 ||
    lengthCm <= 0 ||
    widthCm <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }

  const total = (packageCount * lengthCm * widthCm * heightCm) / 1_000_000;
  return total.toFixed(3);
}

export function getShipmentRequestStepBlockingErrors(
  step: ShipmentRequestStepIndex,
  input: Partial<ShipmentRequestFormValues>,
) {
  switch (step) {
    case 0:
      return {
        ...(hasValue(input.cargoDescription)
          ? {}
          : { cargoDescription: "Add a short description of what you are importing." }),
        ...(hasValue(input.cargoType)
          ? {}
          : { cargoType: "Choose the closest cargo type." }),
        ...getShipmentSizeStepErrors(input),
      };
    case 1: {
      const isNcr = input.destinationRegionCode === "1300000000";

      return {
        ...(hasValue(input.origin)
          ? {}
          : { origin: "Select the China origin city or area." }),
        ...(hasValue(input.deliveryPreference)
          ? {}
          : { deliveryPreference: "Choose how you want the cargo delivered." }),
        ...(hasValue(input.shippingModePreference)
          ? {}
          : { shippingModePreference: "Choose the preferred shipping mode." }),
        ...(hasValue(input.destinationRegionCode) && hasValue(input.destinationRegionName)
          ? {}
          : { destinationRegionCode: "Select the destination region." }),
        ...(hasValue(input.destinationCityMunicipalityCode) &&
        hasValue(input.destinationCityMunicipalityName)
          ? {}
          : {
              destinationCityMunicipalityCode:
                "Select the destination city or municipality.",
            }),
        ...(isNcr ||
        (hasValue(input.destinationProvinceCode) && hasValue(input.destinationProvinceName))
          ? {}
          : { destinationProvinceCode: "Select the destination province." }),
      };
    }
    case 2:
      return hasValue(input.shippingPreference)
        ? {}
        : { shippingPreference: "Choose what matters most for this shipment." };
    case 3:
      return {};
  }
}
