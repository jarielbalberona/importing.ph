import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import nextConfig from "../next.config";
import { apiError, rateLimitResponse } from "../lib/api-response";
import { runBestEffort } from "../lib/best-effort";
import { validateUploadFile, UploadValidationError } from "../lib/file-validation";
import { forcedDownloadHeaders } from "../lib/media-download";
import { normalizeClientIp } from "../app/v1/locations/route-utils";
import { RateLimitError } from "../lib/rate-limit";
import { serializeServerLog } from "../lib/server-log";
import { persistWithObjectCompensation } from "../lib/storage-compensation";
import { renderMarketplaceNotificationEmail } from "../packages/email/src";

test("upload validation accepts supported bytes and rejects extension or MIME mismatches", async () => {
  const pdfBytes = new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n");
  const valid = await validateUploadFile(
    new File([pdfBytes], "packing-list.pdf", { type: "application/pdf" }),
    "shipment_request_attachment",
  );
  assert.equal(valid.detectedContentType, "application/pdf");

  await assert.rejects(
    validateUploadFile(
      new File([pdfBytes], "packing-list.jpg", { type: "image/jpeg" }),
      "shipment_request_attachment",
    ),
    (error) =>
      error instanceof UploadValidationError && error.code === "invalid_file",
  );
  await assert.rejects(
    validateUploadFile(
      new File([pdfBytes], "packing-list.pdf", { type: "image/png" }),
      "shipment_request_attachment",
    ),
    (error) =>
      error instanceof UploadValidationError && error.code === "invalid_file",
  );
});

test("storage persistence failure deletes the uploaded object and preserves the database error", async () => {
  const databaseError = new Error("database unavailable");
  const removed: string[] = [];
  await assert.rejects(
    persistWithObjectCompensation(
      "temporary/object",
      async () => {
        throw databaseError;
      },
      async (key) => {
        removed.push(key);
      },
    ),
    databaseError,
  );
  assert.deepEqual(removed, ["temporary/object"]);
});

test("forced attachment headers prevent inline rendering and caching", () => {
  const headers = forcedDownloadHeaders({
    originalFilename: "supplier quote.pdf",
    sizeBytes: 123,
  });
  assert.match(headers["Content-Disposition"], /^attachment;/);
  assert.equal(headers["Content-Type"], "application/octet-stream");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Cache-Control"], "private, no-store");
});

test("structured logs redact sensitive values and forbidden context keys", () => {
  const record = serializeServerLog(
    "notification.failed",
    new Error(
      "delivery to person@example.com failed for invoice.pdf at https://signed.example/object",
    ),
    {
      requestId: "request-id",
      email: "person@example.com",
      filename: "invoice.pdf",
      token: "secret-token",
    },
  );
  const serialized = JSON.stringify(record);
  assert.match(serialized, /notification\.failed/);
  assert.match(serialized, /request-id/);
  assert.doesNotMatch(serialized, /person@example\.com|invoice\.pdf|signed\.example|secret-token/);
});

test("best-effort notification failures are logged without escaping", async () => {
  const records: string[] = [];
  const original = console.error;
  console.error = (value) => records.push(String(value));
  try {
    const succeeded = await runBestEffort(
      "notification.quote_decision_failed",
      async () => {
        throw new Error("delivery failed");
      },
      { requestId: "request-id", quoteId: "quote-id" },
    );
    assert.equal(succeeded, false);
  } finally {
    console.error = original;
  }
  assert.equal(records.length, 1);
  assert.match(records[0], /notification\.quote_decision_failed/);
  assert.match(records[0], /request-id/);
});

test("API errors have the standard body and rate limits include retry metadata", async () => {
  const unauthorized = apiError(401, "unauthenticated", "Authentication is required.");
  assert.equal(unauthorized.status, 401);
  assert.deepEqual(await unauthorized.json(), {
    error: "unauthenticated",
    message: "Authentication is required.",
  });

  const limited = rateLimitResponse(new RateLimitError(37));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "37");
  assert.deepEqual(await limited.json(), {
    error: "rate_limited",
    message: "Too many requests. Try again later.",
    retryAfter: 37,
  });
});

test("location rate-limit subjects normalize forwarded IPv4 and IPv6", () => {
  assert.equal(normalizeClientIp("203.0.113.7:443"), "203.0.113.7");
  assert.equal(normalizeClientIp("::ffff:203.0.113.7"), "203.0.113.7");
  assert.equal(normalizeClientIp("[2001:db8::1]:443"), "2001:db8::1");
  assert.equal(normalizeClientIp("not-an-ip"), "unknown");
});

test("security headers and Clerk-compatible strict CSP are configured", async () => {
  const entries = await nextConfig.headers?.();
  const headers = Object.fromEntries(
    (entries?.[0]?.headers ?? []).map((header) => [header.key, header.value]),
  );
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Permissions-Policy"], "camera=(), microphone=(), geolocation=()");

  const nextConfigSource = await fs.readFile(
    path.join(process.cwd(), "next.config.ts"),
    "utf8",
  );
  assert.match(nextConfigSource, /Strict-Transport-Security/);

  const rootLayout = await fs.readFile(
    path.join(process.cwd(), "app/layout.tsx"),
    "utf8",
  );
  assert.match(rootLayout, /export const dynamic = "force-dynamic"/);
  assert.match(rootLayout, /<ClerkProvider dynamic>/);

  const middleware = await fs.readFile(path.join(process.cwd(), "proxy.ts"), "utf8");
  assert.match(middleware, /contentSecurityPolicy:\s*{/);
  assert.match(middleware, /strict:\s*true/);
  assert.match(middleware, /"frame-ancestors": \["'none'"\]/);
  assert.match(middleware, /"img-src": \[/);
  assert.match(middleware, /"data:"/);
});

test("marketplace email renders after deprecated component removal", async () => {
  const rendered = await renderMarketplaceNotificationEmail({
    title: "Quote accepted",
    body: "Your quote was accepted.",
    actionLabel: "View request",
    actionUrl: "/app/forwarder/requests/test",
  });
  assert.match(rendered.html, /<html/);
  assert.match(rendered.html, /Quote accepted/);
  assert.match(rendered.html, /https:\/\/importing\.ph\/app\/forwarder\/requests\/test/);
  assert.match(rendered.text, /Your quote was accepted/);
});
