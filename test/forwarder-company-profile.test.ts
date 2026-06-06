import assert from "node:assert/strict";
import test from "node:test";

import {
  canEditForwarderCompanySettings,
  getForwarderCompanyPublicProfileCompleteness,
  getForwarderCompanyPublicProfileStatusText,
  getForwarderCompanyPublicProfileUrl,
} from "@/lib/forwarder-company-profile";

test("complete forwarder public profile reports complete status", () => {
  const completeness = getForwarderCompanyPublicProfileCompleteness({
    name: "ACME Freight",
    slug: "acme-freight",
    shippingModes: "both",
    originCities: "Shenzhen",
    destinationAreas: "Metro Manila",
    serviceDescription: "China to PH consolidation",
  });

  assert.equal(completeness.isComplete, true);
  assert.equal(completeness.completedCount, 5);
  assert.deepEqual(completeness.missingFields, []);
  assert.match(
    getForwarderCompanyPublicProfileStatusText({
      name: "ACME Freight",
      slug: "acme-freight",
      shippingModes: "both",
      originCities: "Shenzhen",
      destinationAreas: "Metro Manila",
      serviceDescription: "China to PH consolidation",
    }),
    /Public profile complete/,
  );
});

test("incomplete forwarder public profile reports missing field list", () => {
  const completeness = getForwarderCompanyPublicProfileCompleteness({
    name: "ACME Freight",
    slug: "acme-freight",
    shippingModes: "both",
    originCities: "",
    destinationAreas: null,
    serviceDescription: "",
  });

  assert.equal(completeness.isComplete, false);
  assert.equal(completeness.completedCount, 2);
  assert.deepEqual(completeness.missingFields, [
    "service description",
    "pickup or origin cities",
    "destination areas",
  ]);
});

test("public URL display uses read-only slug", () => {
  assert.equal(
    getForwarderCompanyPublicProfileUrl("acme-freight"),
    "/forwarder/acme-freight",
  );
  assert.equal(getForwarderCompanyPublicProfileUrl(null), null);
});

test("company name changes do not affect public profile URL helper", () => {
  assert.equal(
    getForwarderCompanyPublicProfileUrl("stable-slug"),
    "/forwarder/stable-slug",
  );
});

test("only owner or admin can edit forwarder company settings", () => {
  assert.equal(canEditForwarderCompanySettings("owner"), true);
  assert.equal(canEditForwarderCompanySettings("admin"), true);
  assert.equal(canEditForwarderCompanySettings("member"), false);
});
