import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../../db/schema";
import {
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  quotes,
  shipmentRequests,
  userProfiles,
} from "../../db/schema";
import { canProfileViewShipmentRequestAttachments } from "../../lib/media";
import {
  acceptQuoteForImporter,
  createQuoteForForwarder,
  QuoteSubmissionError,
  rejectQuoteForImporter,
  updateQuoteForForwarder,
  withdrawQuoteForForwarder,
} from "../../lib/quotes";
import {
  consumeRateLimit,
  RateLimitError,
  type RateLimitPolicy,
} from "../../lib/rate-limit";

const testDatabaseUrl = requireSafeTestDatabaseUrl();
process.env.RATE_LIMIT_HASH_SECRET = "integration-test-rate-limit-secret";

const connections = [connect(), connect(), connect()];
const [first, second, third] = connections;

after(async () => {
  await Promise.all(connections.map(({ client }) => client.end({ timeout: 1 })));
});

beforeEach(async () => {
  await first.client.unsafe("TRUNCATE user_profiles, rate_limit_states CASCADE");
});

test("simultaneous accept operations produce one winner and reject competitors", async () => {
  const fixture = await createMarketplaceFixture();

  const results = await Promise.allSettled([
    acceptQuoteForImporter(first.database, {
      requestId: fixture.requestId,
      quoteId: fixture.quoteIds[0],
      importerProfileId: fixture.importerProfileId,
    }),
    acceptQuoteForImporter(second.database, {
      requestId: fixture.requestId,
      quoteId: fixture.quoteIds[1],
      importerProfileId: fixture.importerProfileId,
    }),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const states = await first.database
    .select({ id: quotes.id, status: quotes.status })
    .from(quotes)
    .where(eq(quotes.shipmentRequestId, fixture.requestId));
  assert.equal(states.filter((quote) => quote.status === "accepted").length, 1);
  assert.equal(states.filter((quote) => quote.status === "rejected").length, 1);

  const [request] = await first.database
    .select({ status: shipmentRequests.status })
    .from(shipmentRequests)
    .where(eq(shipmentRequests.id, fixture.requestId));
  assert.equal(request.status, "quote_selected");
});

test("simultaneous accept and reject cannot create contradictory state", async () => {
  const fixture = await createMarketplaceFixture();
  await Promise.allSettled([
    acceptQuoteForImporter(first.database, {
      requestId: fixture.requestId,
      quoteId: fixture.quoteIds[0],
      importerProfileId: fixture.importerProfileId,
    }),
    rejectQuoteForImporter(second.database, {
      requestId: fixture.requestId,
      quoteId: fixture.quoteIds[0],
      importerProfileId: fixture.importerProfileId,
    }),
  ]);

  const [target] = await first.database
    .select({ status: quotes.status })
    .from(quotes)
    .where(eq(quotes.id, fixture.quoteIds[0]));
  const [request] = await first.database
    .select({ status: shipmentRequests.status })
    .from(shipmentRequests)
    .where(eq(shipmentRequests.id, fixture.requestId));

  assert.ok(target.status === "accepted" || target.status === "rejected");
  assert.equal(request.status === "quote_selected", target.status === "accepted");
});

test("create, update, and withdraw cannot race past request closure", async () => {
  for (const mutation of ["create", "update", "withdraw"] as const) {
    await first.client.unsafe("TRUNCATE user_profiles, rate_limit_states CASCADE");
    const fixture = await createMarketplaceFixture();
    const accept = acceptQuoteForImporter(first.database, {
      requestId: fixture.requestId,
      quoteId: fixture.quoteIds[0],
      importerProfileId: fixture.importerProfileId,
    });

    const mutate =
      mutation === "create"
        ? createQuoteForForwarder(second.database, {
            requestId: fixture.requestId,
            forwarderCompanyId: fixture.companyIds[2],
            forwarderMemberId: fixture.memberIds[2],
            quoteInput: validQuoteInput(),
          })
        : mutation === "update"
          ? updateQuoteForForwarder(second.database, {
              requestId: fixture.requestId,
              quoteId: fixture.quoteIds[1],
              forwarderCompanyId: fixture.companyIds[1],
              quoteInput: { ...validQuoteInput(), quoteAmount: "23456.78" },
            })
          : withdrawQuoteForForwarder(second.database, {
              requestId: fixture.requestId,
              quoteId: fixture.quoteIds[1],
              forwarderCompanyId: fixture.companyIds[1],
            });

    await Promise.allSettled([accept, mutate]);

    const [request] = await first.database
      .select({ status: shipmentRequests.status })
      .from(shipmentRequests)
      .where(eq(shipmentRequests.id, fixture.requestId));
    const submitted = await first.database
      .select({ id: quotes.id })
      .from(quotes)
      .where(
        and(
          eq(quotes.shipmentRequestId, fixture.requestId),
          eq(quotes.status, "submitted"),
        ),
      );
    assert.equal(request.status, "quote_selected", mutation);
    assert.equal(submitted.length, 0, mutation);
  }
});

test("concurrent duplicate quote submissions return the domain duplicate error", async () => {
  const fixture = await createMarketplaceFixture({ createQuotes: false });
  const results = await Promise.allSettled([
    createQuoteForForwarder(first.database, {
      requestId: fixture.requestId,
      forwarderCompanyId: fixture.companyIds[0],
      forwarderMemberId: fixture.memberIds[0],
      quoteInput: validQuoteInput(),
    }),
    createQuoteForForwarder(second.database, {
      requestId: fixture.requestId,
      forwarderCompanyId: fixture.companyIds[0],
      forwarderMemberId: fixture.memberIds[0],
      quoteInput: validQuoteInput(),
    }),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.ok(rejected && rejected.status === "rejected");
  assert.ok(rejected.reason instanceof QuoteSubmissionError);
  assert.equal(rejected.reason.code, "duplicate");
});

test("media relationships allow owner, quoting forwarder, and admin but not a closed-request competitor", async () => {
  const fixture = await createMarketplaceFixture();
  await first.database
    .update(shipmentRequests)
    .set({ status: "quote_selected" })
    .where(eq(shipmentRequests.id, fixture.requestId));

  assert.equal(
    await canProfileViewShipmentRequestAttachments(
      fixture.importerUserProfileId,
      "importer",
      fixture.requestId,
      first.database,
    ),
    true,
  );
  assert.equal(
    await canProfileViewShipmentRequestAttachments(
      fixture.forwarderUserProfileIds[0],
      "forwarder",
      fixture.requestId,
      first.database,
    ),
    true,
  );
  assert.equal(
    await canProfileViewShipmentRequestAttachments(
      fixture.forwarderUserProfileIds[2],
      "forwarder",
      fixture.requestId,
      first.database,
    ),
    false,
  );
  assert.equal(
    await canProfileViewShipmentRequestAttachments(
      fixture.adminUserProfileId,
      "admin",
      fixture.requestId,
      first.database,
    ),
    true,
  );
  assert.equal(
    await canProfileViewShipmentRequestAttachments(
      fixture.importerUserProfileId,
      "forwarder",
      fixture.requestId,
      first.database,
    ),
    false,
  );
});

test("rate limits increment atomically and roll over after the window", async () => {
  const policy = {
    scope: "message_send",
    limit: 2,
    windowSeconds: 60,
  } satisfies RateLimitPolicy;
  const now = new Date("2026-07-14T00:00:00.000Z");
  const results = await Promise.allSettled([
    consumeRateLimit(policy, "subject", now, first.database),
    consumeRateLimit(policy, "subject", now, second.database),
    consumeRateLimit(policy, "subject", now, third.database),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
  const rejected = results.find((result) => result.status === "rejected");
  assert.ok(rejected && rejected.status === "rejected");
  assert.ok(rejected.reason instanceof RateLimitError);
  assert.equal(rejected.reason.retryAfterSeconds, 60);

  const rolled = await consumeRateLimit(
    policy,
    "subject",
    new Date(now.getTime() + 61_000),
    first.database,
  );
  assert.equal(rolled.remaining, 1);
});

function connect() {
  const client = postgres(testDatabaseUrl, {
    max: 1,
    prepare: false,
    onnotice: () => undefined,
  });
  return { client, database: drizzle(client, { schema }) };
}

async function createMarketplaceFixture(options: { createQuotes?: boolean } = {}) {
  const [importerUser] = await first.database
    .insert(userProfiles)
    .values({
      clerkUserId: `test_importer_${crypto.randomUUID()}`,
      role: "importer",
      fullName: "Test Importer",
    })
    .returning({ id: userProfiles.id });
  const [importer] = await first.database
    .insert(importerProfiles)
    .values({
      userProfileId: importerUser.id,
      slug: `test-importer-${crypto.randomUUID()}`,
      companyName: "Test Importer Co",
    })
    .returning({ id: importerProfiles.id });
  const [admin] = await first.database
    .insert(userProfiles)
    .values({
      clerkUserId: `test_admin_${crypto.randomUUID()}`,
      role: "admin",
      fullName: "Test Admin",
    })
    .returning({ id: userProfiles.id });

  const companyIds: string[] = [];
  const memberIds: string[] = [];
  const forwarderUserProfileIds: string[] = [];
  for (let index = 0; index < 3; index += 1) {
    const [user] = await first.database
      .insert(userProfiles)
      .values({
        clerkUserId: `test_forwarder_${index}_${crypto.randomUUID()}`,
        role: "forwarder",
        fullName: `Test Forwarder ${index}`,
      })
      .returning({ id: userProfiles.id });
    const [company] = await first.database
      .insert(forwarderCompanies)
      .values({
        name: `Test Forwarder Company ${index} ${crypto.randomUUID()}`,
        slug: `test-forwarder-${index}-${crypto.randomUUID()}`,
      })
      .returning({ id: forwarderCompanies.id });
    const [member] = await first.database
      .insert(forwarderMembers)
      .values({ userProfileId: user.id, forwarderCompanyId: company.id })
      .returning({ id: forwarderMembers.id });
    forwarderUserProfileIds.push(user.id);
    companyIds.push(company.id);
    memberIds.push(member.id);
  }

  const [request] = await first.database
    .insert(shipmentRequests)
    .values({
      importerProfileId: importer.id,
      status: "posted",
      cargoDescription: "Integration cargo",
      cargoType: "general_goods",
      origin: "Shenzhen",
      destination: "Manila",
      deliveryPreference: "supplier_pickup_to_door",
      shippingModePreference: "sea",
      shippingPreference: "balanced",
    })
    .returning({ id: shipmentRequests.id });

  const quoteIds: string[] = [];
  if (options.createQuotes !== false) {
    for (let index = 0; index < 2; index += 1) {
      const [quote] = await first.database
        .insert(quotes)
        .values({
          shipmentRequestId: request.id,
          forwarderCompanyId: companyIds[index],
          submittedByForwarderMemberId: memberIds[index],
          ...quoteValues(),
        })
        .returning({ id: quotes.id });
      quoteIds.push(quote.id);
    }
  }

  return {
    requestId: request.id,
    importerProfileId: importer.id,
    importerUserProfileId: importerUser.id,
    adminUserProfileId: admin.id,
    forwarderUserProfileIds,
    companyIds,
    memberIds,
    quoteIds,
  };
}

function quoteValues() {
  return {
    status: "submitted" as const,
    quoteAmount: "12345.67",
    currency: "PHP",
    shippingMode: "sea" as const,
    serviceOffered: "Door-to-door freight",
    estimatedTransitMinDays: 14,
    estimatedTransitMaxDays: 21,
    inclusions: "Freight",
    exclusions: "Duties",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000),
  };
}

function validQuoteInput() {
  return {
    quoteAmount: "12345.67",
    currency: "PHP",
    shippingMode: "sea",
    serviceOffered: "Door-to-door freight",
    estimatedTransitMinDays: "14",
    estimatedTransitMaxDays: "21",
    inclusions: "Freight",
    exclusions: "Duties",
    notes: "",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000)
      .toISOString()
      .slice(0, 10),
  };
}

function requireSafeTestDatabaseUrl() {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error("TEST_DATABASE_URL is required for database tests");

  const url = new URL(value);
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const testDatabase = url.pathname.toLowerCase().includes("test");
  if (!localHost || !testDatabase) {
    throw new Error(
      "TEST_DATABASE_URL must use a local host and a database name containing 'test'",
    );
  }
  return value;
}
