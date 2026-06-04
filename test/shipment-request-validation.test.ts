import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createShipmentRequestSchema } from "@/lib/validation";
import { formatDestination } from "@/lib/format";

const validRequest = {
  cargoDescription: "Phone accessories",
  cargoType: "electronics",
  totalCbm: "1.250",
  totalWeightKg: "120",
  origin: "Guangzhou, China",
  destination: "Dumaguete City, Negros Oriental",
  destinationRegionCode: "0700000000",
  destinationRegionName: "Region VII (Central Visayas)",
  destinationProvinceCode: "0704600000",
  destinationProvinceName: "Negros Oriental",
  destinationCityMunicipalityCode: "0746100000",
  destinationCityMunicipalityName: "Dumaguete City",
  deliveryPreference: "door_to_door",
  shippingPreference: "balanced",
};

describe("shipment request validation", () => {
  it("requires structured PSGC destination fields", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      destinationCityMunicipalityCode: undefined,
      destinationCityMunicipalityName: undefined,
    });

    assert.equal(result.success, false);
    assert.deepEqual(
      result.error.issues.map((issue) => issue.message),
      [
        "Select the destination city or municipality.",
        "Select the destination city or municipality.",
      ],
    );
  });

  it("requires province for non-NCR destinations", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      destinationProvinceCode: undefined,
      destinationProvinceName: undefined,
    });

    assert.equal(result.success, false);
    assert.deepEqual(
      result.error.issues.map((issue) => issue.message),
      [
        "Select the destination province.",
        "Select the destination province.",
      ],
    );
  });

  it("accepts province and city without barangay for V1 quote requests", () => {
    const result = createShipmentRequestSchema.safeParse(validRequest);

    assert.equal(result.success, true);
  });

  it("accepts NCR region and city without a province", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      destination: "Makati City, National Capital Region (NCR)",
      destinationRegionCode: "1300000000",
      destinationRegionName: "National Capital Region (NCR)",
      destinationProvinceCode: undefined,
      destinationProvinceName: undefined,
      destinationCityMunicipalityCode: "1380300000",
      destinationCityMunicipalityName: "City of Makati",
      destinationDisplayName: "City of Makati, National Capital Region (NCR)",
    });

    assert.equal(result.success, true);
  });

  it("formats structured and legacy destinations", () => {
    assert.equal(
      formatDestination({
        destination: "Legacy Manila",
        destinationProvinceName: "Negros Oriental",
        destinationCityMunicipalityName: "Dumaguete City",
      }),
      "Dumaguete City, Negros Oriental",
    );
    assert.equal(
      formatDestination({
        destination: "Legacy Manila",
        destinationRegionName: "National Capital Region (NCR)",
        destinationCityMunicipalityName: "City of Makati",
      }),
      "City of Makati, National Capital Region (NCR)",
    );
    assert.equal(formatDestination({ destination: "Legacy Manila" }), "Legacy Manila");
  });

  it("does not leak raw enum values for invalid cargo type", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      cargoType: "not_real",
    });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues[0]?.message,
      "Choose a valid cargo type from the list.",
    );
  });
});
