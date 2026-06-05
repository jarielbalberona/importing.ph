import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createShipmentRequestSchema,
  getShipmentSizeStepErrors,
  otherChinaOriginValue,
} from "@/lib/validation";
import { formatDestination } from "@/lib/format";
import {
  buildDestinationDisplayName,
  calculateEstimatedTotalCbm,
  getShipmentRequestStepBlockingErrors,
} from "@/lib/shipment-request-wizard";

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
  deliveryPreference: "supplier_pickup_to_door",
  shippingModePreference: "sea",
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

  it("accepts a custom China origin city", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      origin: "Wuhan, China",
    });

    assert.equal(result.success, true);
  });

  it("rejects a bare Other China origin without the exact city", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      origin: otherChinaOriginValue,
    });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "origin" &&
          issue.message === "Enter the exact pickup city or location in China.",
      ),
      true,
    );
  });

  it("accepts new importer-facing delivery preferences and rejects old freight terms", () => {
    const validResult = createShipmentRequestSchema.safeParse({
      ...validRequest,
      deliveryPreference: "china_warehouse_to_ph_warehouse",
    });
    const oldResult = createShipmentRequestSchema.safeParse({
      ...validRequest,
      deliveryPreference: "door_to_door",
    });

    assert.equal(validResult.success, true);
    assert.equal(oldResult.success, false);
    assert.equal(
      oldResult.error.issues[0]?.message,
      "Choose a valid delivery preference from the list.",
    );
  });

  it("blocks Step 2 when shipment size and weight are missing", () => {
    assert.deepEqual(getShipmentSizeStepErrors({}), {
      totalWeightKg: "Enter the total gross weight.",
      totalCbm:
        "Provide either total CBM or complete package dimensions with package count.",
    });
  });

  it("blocks Step 2 when only weight is provided", () => {
    assert.deepEqual(getShipmentSizeStepErrors({ totalWeightKg: "50" }), {
      totalCbm:
        "Provide either total CBM or complete package dimensions with package count.",
    });
  });

  it("blocks Step 2 when CBM is provided without weight", () => {
    assert.deepEqual(getShipmentSizeStepErrors({ totalCbm: "1.5" }), {
      totalWeightKg: "Enter the total gross weight.",
    });
  });

  it("allows Step 2 when CBM and weight are provided", () => {
    assert.deepEqual(
      getShipmentSizeStepErrors({ totalCbm: "1.5", totalWeightKg: "50" }),
      {},
    );
  });

  it("blocks Step 2 when dimensions are partial or missing package count", () => {
    const dimensionMessage =
      "Complete length, width, and height, or use total CBM instead.";

    assert.deepEqual(
      getShipmentSizeStepErrors({
        lengthCm: "50",
        widthCm: "40",
        packageCount: "20",
        totalWeightKg: "50",
      }),
      {
        lengthCm: dimensionMessage,
        widthCm: dimensionMessage,
        heightCm: dimensionMessage,
      },
    );

    assert.deepEqual(
      getShipmentSizeStepErrors({
        lengthCm: "50",
        widthCm: "40",
        heightCm: "30",
        totalWeightKg: "50",
      }),
      {
        packageCount: "Package/carton count is required when using dimensions.",
      },
    );
  });

  it("allows Step 2 when complete dimensions, package count, and weight are provided", () => {
    assert.deepEqual(
      getShipmentSizeStepErrors({
        lengthCm: "50",
        widthCm: "40",
        heightCm: "30",
        packageCount: "20",
        totalWeightKg: "50",
      }),
      {},
    );
  });

  it("rejects zero, negative, and invalid numeric Step 2 values in the schema", () => {
    for (const invalidValue of ["0", "-1", "abc"]) {
      const result = createShipmentRequestSchema.safeParse({
        ...validRequest,
        totalCbm: invalidValue,
      });

      assert.equal(result.success, false);
      assert.equal(
        result.error.issues.some(
          (issue) => issue.message === "Enter a valid CBM greater than 0.",
        ),
        true,
      );
    }
  });

  it("accepts complete dimensions with package count and weight without CBM", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      totalCbm: undefined,
      lengthCm: "50",
      widthCm: "40",
      heightCm: "30",
      packageCount: "20",
      totalWeightKg: "50",
    });

    assert.equal(result.success, true);
  });

  it("blocks cargo step progression when required fields are missing", () => {
    assert.deepEqual(getShipmentRequestStepBlockingErrors(0, {}), {
      cargoDescription: "Add a short description of what you are importing.",
      cargoType: "Choose the closest cargo type.",
      totalWeightKg: "Enter the total gross weight.",
      totalCbm:
        "Provide either total CBM or complete package dimensions with package count.",
    });
  });

  it("blocks route step progression when origin and PSGC destination are incomplete", () => {
    assert.deepEqual(
      getShipmentRequestStepBlockingErrors(1, {
        destinationRegionCode: "0700000000",
        destinationRegionName: "Region VII (Central Visayas)",
      }),
      {
        origin: "Select the China origin city or area.",
        deliveryPreference: "Choose how you want the cargo delivered.",
        shippingModePreference: "Choose the preferred shipping mode.",
        destinationCityMunicipalityCode:
          "Select the destination city or municipality.",
        destinationProvinceCode: "Select the destination province.",
      },
    );
  });

  it("blocks preferences step progression when quote priority is missing", () => {
    assert.deepEqual(getShipmentRequestStepBlockingErrors(2, {}), {
      shippingPreference: "Choose what matters most for this shipment.",
    });
  });

  it("requires shipping mode preference", () => {
    const result = createShipmentRequestSchema.safeParse({
      ...validRequest,
      shippingModePreference: undefined,
    });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) => issue.message === "Choose the preferred shipping mode.",
      ),
      true,
    );
  });

  it("does not let empty defaults bypass required validation on final submit", () => {
    const result = createShipmentRequestSchema.safeParse({});

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.message === "Add a short description of what you are importing.",
      ),
      true,
    );
    assert.equal(
      result.error.issues.some(
        (issue) => issue.message === "Choose what matters most for this shipment.",
      ),
      true,
    );
  });

  it("builds readable destination labels from PSGC names", () => {
    assert.equal(
      buildDestinationDisplayName({
        cityMunicipalityName: "Dumaguete City",
        provinceName: "Negros Oriental",
      }),
      "Dumaguete City, Negros Oriental",
    );
    assert.equal(
      buildDestinationDisplayName({
        barangayName: "Poblacion 1",
        cityMunicipalityName: "City of Makati",
        regionName: "National Capital Region (NCR)",
      }),
      "Poblacion 1, City of Makati, National Capital Region (NCR)",
    );
  });

  it("calculates estimated total CBM from carton dimensions and package count", () => {
    assert.equal(
      calculateEstimatedTotalCbm({
        packageCount: "20",
        lengthCm: "50",
        widthCm: "40",
        heightCm: "30",
      }),
      "1.200",
    );
    assert.equal(
      calculateEstimatedTotalCbm({
        packageCount: "20",
        lengthCm: "50",
        widthCm: "",
        heightCm: "30",
      }),
      null,
    );
  });
});
