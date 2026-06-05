import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  quoteSubmissionSchema,
  quoteSubmissionSchemaForRequestMode,
} from "@/lib/validation";

const validQuote = {
  quoteAmount: "25000.00",
  currency: "PHP",
  shippingMode: "sea",
  serviceOffered: "Door-to-door",
  estimatedTransitMinDays: 9,
  estimatedTransitMaxDays: 15,
  inclusions: "Pickup, freight, customs processing, delivery",
  exclusions: "Duties, storage, special handling",
  notes: "Importer should confirm packing list before dispatch.",
  validUntil: "2099-07-01",
};

describe("quote submission validation", () => {
  it("accepts a valid quote payload", () => {
    const result = quoteSubmissionSchema.safeParse(validQuote);

    assert.equal(result.success, true);
  });

  it("forces PHP as the only supported currency", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      currency: "USD",
    });

    assert.equal(result.success, false);
  });

  it("requires service coverage text", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      serviceOffered: "",
    });

    assert.equal(result.success, false);
  });

  it("requires a valid quote shipping mode", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      shippingMode: "truck",
    });

    assert.equal(result.success, false);
  });

  it("requires maximum transit days to be greater than or equal to minimum", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      estimatedTransitMinDays: 18,
      estimatedTransitMaxDays: 12,
    });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "estimatedTransitMaxDays" &&
          issue.message ===
            "Maximum transit days must be greater than or equal to minimum.",
      ),
      true,
    );
  });

  it("keeps quote coverage and notes optional", () => {
    const optionalFieldsResult = quoteSubmissionSchema.safeParse({
      ...validQuote,
      inclusions: "",
      exclusions: "",
      notes: "",
    });

    assert.equal(optionalFieldsResult.success, true);
  });

  it("shows a required message instead of NaN errors for empty transit fields", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      estimatedTransitMinDays: "",
      estimatedTransitMaxDays: "",
    });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "estimatedTransitMinDays" &&
          issue.message === "Enter the starting transit estimate.",
      ),
      true,
    );
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "estimatedTransitMaxDays" &&
          issue.message === "Enter the ending transit estimate.",
      ),
      true,
    );
  });

  it("rejects quote modes that do not match a fixed importer request", () => {
    const result = quoteSubmissionSchemaForRequestMode("air").safeParse({
      ...validQuote,
      shippingMode: "sea",
    });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "shippingMode" &&
          issue.message ===
            "Quote shipping mode must match the importer request: Air cargo.",
      ),
      true,
    );
  });
});
