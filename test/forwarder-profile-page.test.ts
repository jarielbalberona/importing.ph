import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ForwarderCompanyProfilePage } from "@/components/public/forwarder-company-profile-page";
import {
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
  buildAfterAuthRedirectUrl,
  normalizeAppRedirectPath,
  normalizeAuthRedirectIntent,
  resolveAuthenticatedDestination,
  resolveOnboardingDestination,
} from "@/lib/auth-redirect";
import {
  buildForwarderCompanyProfileMetadata,
  resolveForwarderProfileCta,
} from "@/lib/forwarder-profile-page";
import { getForwarderCompanyProfileBySlug } from "@/lib/profile-route-queries";

const profile = {
  slug: "acme-freight",
  name: "ACME Freight",
  shippingModes: "both",
  originCities: "Shenzhen, Guangzhou",
  destinationAreas: "Metro Manila, Cebu",
  serviceDescription: "China to Philippines consolidation and door-to-door support.",
  createdAt: new Date("2026-01-01T00:00:00Z"),
} as const;

test("known slug resolves a public-safe forwarder company profile", async () => {
  const result = await getForwarderCompanyProfileBySlug(
    "acme-freight",
    async () => ({
      ...profile,
      isSuspended: false,
    }),
  );

  assert.deepEqual(result, profile);
});

test("unknown slug resolves to null for notFound handling", async () => {
  const result = await getForwarderCompanyProfileBySlug(
    "missing-company",
    async () => undefined,
  );

  assert.equal(result, null);
});

test("suspended company stays hidden from the public route", async () => {
  const result = await getForwarderCompanyProfileBySlug(
    "acme-freight",
    async () => ({
      ...profile,
      isSuspended: true,
    }),
  );

  assert.equal(result, null);
});

test("rendered profile stays public-safe and excludes staff data", () => {
  const html = renderToStaticMarkup(
    React.createElement(ForwarderCompanyProfilePage, {
      profile,
      cta: resolveForwarderProfileCta({
        companySlug: profile.slug,
      }),
    }),
  );

  assert.match(html, /ACME Freight/);
  assert.match(html, /China to Philippines consolidation and door-to-door support\./);
  assert.match(html, /Post a shipment request/);
  assert.doesNotMatch(html, /contactPerson/i);
  assert.doesNotMatch(html, /contactEmail/i);
  assert.doesNotMatch(html, /submitted_by_forwarder_member_id/i);
  assert.doesNotMatch(html, /userProfileId/i);
});

test("logged-out CTA routes to sign-up with a return URL", () => {
  const cta = resolveForwarderProfileCta({
    companySlug: "acme-freight",
  });

  assert.equal(cta.label, "Post a shipment request");
  assert.equal(
    cta.href,
    "/sign-up?redirect_url=%2Fforwarder%2Facme-freight&intent=post_shipment_request",
  );
});

test("importer CTA routes into the existing shipment request flow", () => {
  const cta = resolveForwarderProfileCta({
    companySlug: "acme-freight",
    viewerRole: "importer",
  });

  assert.equal(cta.href, "/app/requests/new");
  assert.equal(cta.label, "Post a shipment request");
});

test("forwarder CTA stays read-only and routes to open requests", () => {
  const cta = resolveForwarderProfileCta({
    companySlug: "acme-freight",
    viewerRole: "forwarder",
  });

  assert.equal(cta.href, "/app/forwarder/requests");
  assert.equal(cta.label, "View open requests");
});

test("forwarder profile metadata uses safe company profile content", () => {
  const metadata = buildForwarderCompanyProfileMetadata(profile);

  assert.equal(
    metadata.title,
    "ACME Freight | Forwarder Profile | Importing Philippines",
  );
  assert.equal(
    metadata.description,
    "China to Philippines consolidation and door-to-door support.",
  );
  assert.equal(
    metadata.alternates?.canonical,
    "/forwarder/acme-freight",
  );
});

test("redirect paths stay internal-only", () => {
  assert.equal(
    normalizeAppRedirectPath("/forwarder/acme-freight"),
    "/forwarder/acme-freight",
  );
  assert.equal(
    normalizeAppRedirectPath("/forwarder/acme-freight?tab=overview"),
    "/forwarder/acme-freight?tab=overview",
  );
  assert.equal(normalizeAppRedirectPath("https://evil.example.com"), null);
  assert.equal(normalizeAppRedirectPath("//evil.example.com"), null);
  assert.equal(normalizeAppRedirectPath("/\\evil.example.com"), null);
});

test("intent normalization only allows known CTA intents", () => {
  assert.equal(
    normalizeAuthRedirectIntent(POST_SHIPMENT_REQUEST_INTENT),
    POST_SHIPMENT_REQUEST_INTENT,
  );
  assert.equal(normalizeAuthRedirectIntent("evil"), null);
});

test("auth entry params preserve safe redirect and intent", () => {
  assert.equal(
    appendAuthRedirectParams("/sign-in", {
      redirectPath: "/forwarder/acme-freight",
      intent: POST_SHIPMENT_REQUEST_INTENT,
    }),
    "/sign-in?redirect_url=%2Fforwarder%2Facme-freight&intent=post_shipment_request",
  );
});

test("after-auth redirect url preserves safe internal return paths and intent", () => {
  assert.equal(
    buildAfterAuthRedirectUrl({
      redirectPath: "/forwarder/acme-freight",
      intent: POST_SHIPMENT_REQUEST_INTENT,
    }),
    "/after-auth?redirect_url=%2Fforwarder%2Facme-freight&intent=post_shipment_request",
  );
  assert.equal(
    buildAfterAuthRedirectUrl({
      redirectPath: "https://evil.example.com",
      intent: "evil",
    }),
    "/after-auth",
  );
});

test("after-auth resolver sends importer CTA intent to new request flow", () => {
  assert.equal(
    resolveAuthenticatedDestination({
      role: "importer",
      redirectPath: "/forwarder/acme-freight",
      intent: POST_SHIPMENT_REQUEST_INTENT,
    }),
    "/app/requests/new",
  );
});

test("after-auth resolver keeps forwarder CTA intent in forwarder workspace", () => {
  assert.equal(
    resolveAuthenticatedDestination({
      role: "forwarder",
      redirectPath: "/forwarder/acme-freight",
      intent: POST_SHIPMENT_REQUEST_INTENT,
    }),
    "/app/forwarder/requests",
  );
});

test("after-auth resolver falls back to safe internal redirect when no CTA intent exists", () => {
  assert.equal(
    resolveAuthenticatedDestination({
      role: "importer",
      redirectPath: "/forwarder/acme-freight?tab=overview",
    }),
    "/forwarder/acme-freight?tab=overview",
  );
});

test("onboarding destination preserves safe CTA intent", () => {
  assert.equal(
    resolveOnboardingDestination({
      redirectPath: "/forwarder/acme-freight",
      intent: POST_SHIPMENT_REQUEST_INTENT,
    }),
    "/onboarding?redirect_url=%2Fforwarder%2Facme-freight&intent=post_shipment_request",
  );
});
