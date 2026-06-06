import assert from "node:assert/strict";
import test from "node:test";

import {
  generateUniqueSlug,
  getForwarderCompanySlugSource,
  getImporterProfileSlugSource,
  normalizeSlug,
  normalizeSlugWithFallback,
} from "@/lib/slug";
import {
  getForwarderCompanyProfileBySlug,
  getImporterProfileBySlug,
  ImporterProfileAuthError,
} from "@/lib/profile-route-queries";

test("slug normalization lowercases and strips unsafe characters", () => {
  assert.equal(normalizeSlug("  ABC Logistics & Cargo, Inc. "), "abc-logistics-cargo-inc");
});

test("slug normalization falls back when the input becomes empty", () => {
  assert.equal(normalizeSlugWithFallback("!!!", "Importer Profile"), "importer-profile");
});

test("unique slug generation appends numeric suffixes on collision", async () => {
  const taken = new Set(["abc-logistics", "abc-logistics-2"]);

  const slug = await generateUniqueSlug("ABC Logistics", {
    fallback: "forwarder-company",
    isUnique: async (candidate) => !taken.has(candidate),
  });

  assert.equal(slug, "abc-logistics-3");
});

test("forwarder slug source is based on company name", () => {
  assert.equal(getForwarderCompanySlugSource("ACME Freight"), "acme-freight");
});

test("importer slug source prefers company name and falls back to full name", () => {
  assert.equal(
    getImporterProfileSlugSource({
      companyName: "Bright Imports PH",
      fullName: "Jane Dela Cruz",
    }),
    "bright-imports-ph",
  );

  assert.equal(
    getImporterProfileSlugSource({
      companyName: "",
      fullName: "Jane Dela Cruz",
    }),
    "jane-dela-cruz",
  );
});

test("forwarder lookup returns a public-safe profile by slug", async () => {
  const profile = await getForwarderCompanyProfileBySlug(
    "acme-freight",
    async () => ({
      slug: "acme-freight",
      name: "ACME Freight",
      shippingModes: "both",
      originCities: "Shenzhen",
      destinationAreas: "Metro Manila",
      serviceDescription: "China to PH consolidation",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      isSuspended: false,
    }),
  );

  assert.deepEqual(profile, {
    slug: "acme-freight",
    name: "ACME Freight",
    shippingModes: "both",
    originCities: "Shenzhen",
    destinationAreas: "Metro Manila",
    serviceDescription: "China to PH consolidation",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
  assert.equal("contactEmail" in (profile ?? {}), false);
  assert.equal("contactPerson" in (profile ?? {}), false);
});

test("suspended forwarder profiles are hidden", async () => {
  const profile = await getForwarderCompanyProfileBySlug(
    "acme-freight",
    async () => ({
      slug: "acme-freight",
      name: "ACME Freight",
      shippingModes: "both",
      originCities: null,
      destinationAreas: null,
      serviceDescription: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      isSuspended: true,
    }),
  );

  assert.equal(profile, null);
});

test("importer lookup requires authenticated viewer context", async () => {
  await assert.rejects(
    () =>
      getImporterProfileBySlug("bright-imports", null, async () => ({
        slug: "bright-imports",
        companyName: "Bright Imports",
        fullName: "Jane Dela Cruz",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      })),
    ImporterProfileAuthError,
  );
});

test("importer lookup returns only safe authenticated-view fields", async () => {
  const profile = await getImporterProfileBySlug(
    "bright-imports",
    {
      userProfileId: "viewer-1",
      role: "importer",
    },
    async () => ({
      slug: "bright-imports",
      companyName: "Bright Imports",
      fullName: "Jane Dela Cruz",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    }),
  );

  assert.deepEqual(profile, {
    slug: "bright-imports",
    companyName: "Bright Imports",
    displayName: "Bright Imports",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
  assert.equal("contactPhone" in (profile ?? {}), false);
  assert.equal("email" in (profile ?? {}), false);
  assert.equal("location" in (profile ?? {}), false);
});
