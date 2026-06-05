import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { GuideLinksCard } from "@/components/guides/guide-links-card";

const guides = [
  {
    slug: "what-is-cbm",
    title: "What Is CBM in Shipping?",
    description: "Understand carton volume and when rough estimates are acceptable.",
  },
  {
    slug: "how-to-request-a-shipping-quote",
    title: "How to Request a Shipping Quote Properly",
    description: "See the usual details forwarders need before they can quote clearly.",
  },
];

test("guide links card renders collapsed by default", () => {
  const html = renderToStaticMarkup(
    React.createElement(GuideLinksCard, {
      title: "Need help estimating shipment size?",
      description: "Use these before posting if you are unsure about CBM.",
      guides,
    }),
  );

  assert.match(html, /Need help estimating shipment size\?/);
  assert.match(html, /Show guides/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /What Is CBM in Shipping\?/);
  assert.doesNotMatch(html, /How to Request a Shipping Quote Properly/);
  assert.doesNotMatch(
    html,
    /Use these before posting if you are unsure about CBM\./,
  );
});

test("guide links card can render open by default", () => {
  const html = renderToStaticMarkup(
    React.createElement(GuideLinksCard, {
      title: "Need help estimating shipment size?",
      description: "Use these before posting if you are unsure about CBM.",
      guides,
      defaultOpen: true,
    }),
  );

  assert.match(html, /Hide guides/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /What Is CBM in Shipping\?/);
  assert.match(html, /How to Request a Shipping Quote Properly/);
  assert.match(html, /Use these before posting if you are unsure about CBM\./);
});

test("guide links card can keep the description visible while collapsed", () => {
  const html = renderToStaticMarkup(
    React.createElement(GuideLinksCard, {
      title: "Need help estimating shipment size?",
      description: "Use these before posting if you are unsure about CBM.",
      guides,
      descriptionPlacement: "collapsed" as const,
    }),
  );

  assert.match(html, /Show guides/);
  assert.match(html, /Use these before posting if you are unsure about CBM\./);
  assert.doesNotMatch(html, /What Is CBM in Shipping\?/);
});
