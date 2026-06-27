import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildMarketplaceNotificationEmail,
  renderMarketplaceNotificationEmail,
} from "@/packages/email/src";
import { renderQuoteSummaryPdf } from "@/packages/pdf/src";

test("email package renders marketplace notification html and text", async () => {
  const rendered = await renderMarketplaceNotificationEmail({
    recipientName: "Importer",
    title: "New quote received",
    body: "A forwarder sent a quote for your shipment request.",
    actionLabel: "View quote",
    actionUrl: "/app/requests/request-id",
  });

  assert.match(rendered.html, /New quote received/);
  assert.match(rendered.html, /https:\/\/importing\.ph\/app\/requests\/request-id/);
  assert.match(rendered.text, /A forwarder sent a quote/);
});

test("email package builds a Resend payload without sending", async () => {
  const payload = await buildMarketplaceNotificationEmail({
    to: "importer@example.com",
    from: "importing.ph <notifications@example.com>",
    recipientName: "Importer",
    title: "New shipment request posted",
    body: "A new request is ready for forwarder quotes.",
    actionLabel: "View request",
    actionUrl: "/app/forwarder/requests/request-id",
  });

  assert.equal(payload.to, "importer@example.com");
  assert.equal(payload.subject, "New shipment request posted");
  assert.match(payload.html, /New shipment request posted/);
  assert.match(payload.text, /new request is ready/i);
});

test("pdf package renders a quote summary PDF buffer", async () => {
  const buffer = await renderQuoteSummaryPdf({
    requestTitle: "Phone accessories Guangzhou to Manila",
    importerCompany: "Importer Trading",
    forwarderCompany: "Forwarder Logistics",
    quoteAmount: "PHP 25,000.00",
    shippingMode: "sea",
    transitRange: "12-18 days",
    inclusions: "China pickup, sea freight, customs assistance",
    exclusions: "Duties, taxes, storage",
    validUntil: "2026-07-15",
  });

  assert.ok(buffer.length > 0);
});
