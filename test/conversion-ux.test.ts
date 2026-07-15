import assert from "node:assert/strict";
import test from "node:test";

import { authEntryCopy } from "@/lib/auth-entry-copy";
import {
  appendAuthRedirectParams,
  JOIN_AS_FORWARDER_INTENT,
  normalizeAuthRedirectIntent,
  resolveAuthenticatedDestination,
} from "@/lib/auth-redirect";
import {
  buildFunnelEventDedupeKey,
  funnelEventNameSchema,
} from "@/lib/funnel-events";
import { onboardingSchema } from "@/lib/onboarding";
import {
  inferShipmentSizingMethod,
  prepareShipmentSizingForSubmission,
} from "@/lib/shipment-request-wizard";

test("forwarder join intent normalizes and survives auth cross-links", () => {
  assert.equal(
    normalizeAuthRedirectIntent(JOIN_AS_FORWARDER_INTENT),
    JOIN_AS_FORWARDER_INTENT,
  );
  assert.equal(
    appendAuthRedirectParams("/sign-in", {
      redirectPath: "/forwarder/acme",
      intent: JOIN_AS_FORWARDER_INTENT,
    }),
    "/sign-in?redirect_url=%2Fforwarder%2Facme&intent=join_as_forwarder",
  );
  assert.equal(
    resolveAuthenticatedDestination({
      role: "forwarder",
      intent: JOIN_AS_FORWARDER_INTENT,
    }),
    "/app/forwarder/requests",
  );
});

test("auth entry copy follows importer, forwarder, and public quote intent", () => {
  assert.equal(
    authEntryCopy("sign-up", "post_shipment_request").title,
    "Create your importer account",
  );
  assert.equal(
    authEntryCopy("sign-up", "join_as_forwarder").title,
    "Create your forwarder account",
  );
  assert.equal(
    authEntryCopy("sign-up", "submit_quote").title,
    "Create a forwarder account to quote this shipment",
  );
});

test("onboarding validation is role-specific", () => {
  assert.equal(
    onboardingSchema.safeParse({
      role: "importer",
      fullName: "Test Importer",
      companyName: "Importer Co",
    }).success,
    true,
  );
  assert.equal(
    onboardingSchema.safeParse({
      role: "forwarder",
      fullName: "Test Forwarder",
      companyName: "Forwarder Co",
    }).success,
    false,
  );
  assert.equal(
    onboardingSchema.safeParse({
      role: "forwarder",
      fullName: "Test Forwarder",
      companyName: "Forwarder Co",
      shippingModes: "both",
      originCities: "Shenzhen",
      destinationAreas: "Metro Manila",
      serviceDescription: "Sea and air forwarding from China to the Philippines.",
    }).success,
    true,
  );
});

test("shipment sizing infers drafts, calculates CBM, and omits inactive values", () => {
  assert.equal(
    inferShipmentSizingMethod({ totalCbm: "1.250" }),
    "known_cbm",
  );
  assert.equal(
    inferShipmentSizingMethod({ totalCbm: "1.200", packageCount: "10" }),
    "dimensions",
  );

  assert.deepEqual(
    prepareShipmentSizingForSubmission(
      {
        totalCbm: "2.500",
        totalWeightKg: "100",
        packageCount: "10",
        lengthCm: "50",
        widthCm: "40",
        heightCm: "30",
      },
      "known_cbm",
    ),
    {
      totalCbm: "2.500",
      totalWeightKg: "100",
      packageCount: undefined,
      lengthCm: undefined,
      widthCm: undefined,
      heightCm: undefined,
    },
  );

  assert.equal(
    prepareShipmentSizingForSubmission(
      {
        packageCount: "10",
        lengthCm: "50",
        widthCm: "40",
        heightCm: "30",
      },
      "dimensions",
    ).totalCbm,
    "0.600",
  );
});

test("funnel event names are allowlisted and dedupe keys are deterministic", () => {
  assert.equal(funnelEventNameSchema.safeParse("quote_submitted").success, true);
  assert.equal(funnelEventNameSchema.safeParse("email_opened").success, false);

  const input = {
    journeyId: "8f4368da-288f-48e3-acbe-866a242c34ce",
    eventName: "request_posted" as const,
    role: "importer" as const,
    entityType: "shipment_request" as const,
    entityId: "5aee2fa9-a61c-4ac6-93ca-6601d1d5e394",
  };
  assert.equal(
    buildFunnelEventDedupeKey(input),
    buildFunnelEventDedupeKey(input),
  );
});
