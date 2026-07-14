import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import sitemap from "../app/sitemap";
import { PublicRequestCta } from "../components/requests/public-request-cta";
import {
  appendAuthRedirectParams,
  normalizeAuthRedirectIntent,
  resolveAuthenticatedDestination,
  SUBMIT_QUOTE_INTENT,
} from "../lib/auth-redirect";
import {
  absolutePublicRequestUrl,
  publicShareTokenSchema,
} from "../lib/public-request-links";
import {
  generatePublicShareToken,
  publicSummarySchema,
} from "../lib/request-sharing";

test("public request tokens are 16-character URL-safe random identifiers", () => {
  const tokens = Array.from({ length: 100 }, generatePublicShareToken);

  assert.equal(new Set(tokens).size, tokens.length);
  for (const token of tokens) {
    assert.equal(token.length, 16);
    assert.match(token, /^[A-Za-z0-9_-]{16}$/);
    assert.equal(publicShareTokenSchema.safeParse(token).success, true);
  }
});

test("public summaries are trimmed and constrained to 10 through 280 characters", () => {
  assert.equal(publicSummarySchema.parse("  Ten letters  "), "Ten letters");
  assert.equal(publicSummarySchema.safeParse("Too short").success, false);
  assert.equal(publicSummarySchema.safeParse("x".repeat(281)).success, false);
});

test("public links use the current browser origin without an environment variable", () => {
  assert.equal(
    absolutePublicRequestUrl("http://localhost:5001/ignored", "7HD3kP9xQ2WaAbCd"),
    "http://localhost:5001/r/7HD3kP9xQ2WaAbCd",
  );
  assert.equal(
    absolutePublicRequestUrl("https://staging.importing.ph", "7HD3kP9xQ2WaAbCd"),
    "https://staging.importing.ph/r/7HD3kP9xQ2WaAbCd",
  );
});

test("submit-quote auth intent preserves the public request through authentication", () => {
  const path = "/r/7HD3kP9xQ2WaAbCd";
  assert.equal(
    appendAuthRedirectParams("/sign-in", {
      redirectPath: path,
      intent: SUBMIT_QUOTE_INTENT,
    }),
    "/sign-in?redirect_url=%2Fr%2F7HD3kP9xQ2WaAbCd&intent=submit_quote",
  );
  assert.equal(normalizeAuthRedirectIntent("submit_quote"), "submit_quote");
  assert.equal(
    resolveAuthenticatedDestination({
      role: "forwarder",
      redirectPath: path,
      intent: SUBMIT_QUOTE_INTENT,
    }),
    path,
  );
});

test("public quotation CTA renders every viewer state without a direct quote form", () => {
  const cases = [
    [{ kind: "anonymous" } as const, "Sign in to quote"],
    [{ kind: "onboarding" } as const, "Finish account setup"],
    [{ kind: "forwarder_suspended" } as const, "suspended"],
    [{ kind: "forwarder_unavailable" } as const, "membership is unavailable"],
    [{ kind: "wrong_role", role: "importer" } as const, "Only forwarder accounts"],
    [
      { kind: "forwarder_eligible", hasExistingQuote: false } as const,
      "Submit quotation",
    ],
    [
      { kind: "forwarder_eligible", hasExistingQuote: true } as const,
      "View your quotation",
    ],
  ] as const;

  for (const [viewer, expected] of cases) {
    const html = renderToStaticMarkup(
      React.createElement(PublicRequestCta, {
        isAcceptingQuotes: true,
        requestId: "00000000-0000-4000-8000-000000000000",
        token: "7HD3kP9xQ2WaAbCd",
        viewer,
      }),
    );
    assert.match(html, new RegExp(expected));
    assert.doesNotMatch(html, /<form/i);
  }

  const closed = renderToStaticMarkup(
    React.createElement(PublicRequestCta, {
      isAcceptingQuotes: false,
      requestId: "00000000-0000-4000-8000-000000000000",
      token: "7HD3kP9xQ2WaAbCd",
      viewer: { kind: "forwarder_eligible", hasExistingQuote: false },
    }),
  );
  assert.match(closed, /No longer accepting quotations/);
  assert.doesNotMatch(closed, /Submit quotation/);
});

test("dynamic share routes remain noindex and excluded from the sitemap", async () => {
  const entries = sitemap().map((entry) => entry.url);
  assert.equal(entries.some((entry) => new URL(entry).pathname.startsWith("/r/")), false);

  const source = await fs.readFile(
    path.join(process.cwd(), "app/r/[token]/page.tsx"),
    "utf8",
  );
  assert.match(source, /robots: \{ index: false, follow: false \}/);
  assert.match(source, /alternates: \{ canonical \}/);
  assert.match(source, /assets\/importingph-logo-bg-blue\.png/);
});
