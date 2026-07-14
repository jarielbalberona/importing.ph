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
import {
  disableRequestSharingForImporter,
  enableRequestSharingForImporter,
  findPublicShipmentRequestByToken,
  RequestShareError,
  rotateRequestShareLinkForImporter,
} from "../../lib/request-sharing";
import { resolvePublicRequestViewer } from "../../lib/public-request-viewer";

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

test("public request sharing is opt-in, owner-controlled, and preserves token on summary updates", async () => {
  const fixture = await createMarketplaceFixture();
  const other = await createMarketplaceFixture({ createQuotes: false });
  const [initial] = await first.database
    .select({
      token: shipmentRequests.publicShareToken,
      summary: shipmentRequests.publicSummary,
      sharedAt: shipmentRequests.publicSharedAt,
    })
    .from(shipmentRequests)
    .where(eq(shipmentRequests.id, fixture.requestId));
  assert.deepEqual(initial, { token: null, summary: null, sharedAt: null });

  await assert.rejects(
    enableRequestSharingForImporter(first.database, {
      requestId: fixture.requestId,
      importerProfileId: other.importerProfileId,
      publicSummary: "Private ownership must be enforced.",
    }),
    (error) => error instanceof RequestShareError && error.code === "not_found",
  );

  const enabled = await enableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
    publicSummary: "  General cargo moving from Shenzhen to Metro Manila.  ",
    now: new Date("2026-07-14T01:00:00.000Z"),
  });
  assert.ok(enabled.publicShareToken);
  assert.equal(enabled.publicSummary, "General cargo moving from Shenzhen to Metro Manila.");

  const updated = await enableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
    publicSummary: "Updated public-only summary for prospective forwarders.",
    now: new Date("2026-07-14T02:00:00.000Z"),
  });
  assert.equal(updated.publicShareToken, enabled.publicShareToken);
  assert.equal(updated.publicSharedAt?.toISOString(), "2026-07-14T01:00:00.000Z");
});

test("public link rotation, disable, and re-enable invalidate every previous token", async () => {
  const fixture = await createMarketplaceFixture({ createQuotes: false });
  const enabled = await enableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
    publicSummary: "A safe public summary for a shipment quotation request.",
  });
  const firstToken = enabled.publicShareToken!;

  const rotated = await rotateRequestShareLinkForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
  });
  assert.notEqual(rotated.publicShareToken, firstToken);
  assert.equal(await findPublicShipmentRequestByToken(first.database, firstToken), null);

  const secondToken = rotated.publicShareToken!;
  await disableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
  });
  assert.equal(await findPublicShipmentRequestByToken(first.database, secondToken), null);

  const [disabled] = await first.database
    .select({
      token: shipmentRequests.publicShareToken,
      summary: shipmentRequests.publicSummary,
      sharedAt: shipmentRequests.publicSharedAt,
    })
    .from(shipmentRequests)
    .where(eq(shipmentRequests.id, fixture.requestId));
  assert.equal(disabled.token, null);
  assert.equal(disabled.summary, enabled.publicSummary);
  assert.ok(disabled.sharedAt);

  const reEnabled = await enableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
    publicSummary: disabled.summary,
  });
  assert.notEqual(reEnabled.publicShareToken, firstToken);
  assert.notEqual(reEnabled.publicShareToken, secondToken);
});

test("closed public links retain only the approved safe projection and cannot be edited or rotated", async () => {
  const fixture = await createMarketplaceFixture({ createQuotes: false });
  const enabled = await enableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
    publicSummary: "Visible summary without importer identity or private cargo notes.",
  });
  await first.database
    .update(shipmentRequests)
    .set({ status: "cancelled" })
    .where(eq(shipmentRequests.id, fixture.requestId));

  const record = await findPublicShipmentRequestByToken(
    first.database,
    enabled.publicShareToken!,
  );
  assert.ok(record);
  assert.equal(record.request.isAcceptingQuotes, false);
  assert.deepEqual(Object.keys(record.request).sort(), [
    "cargoType",
    "deliveryPreference",
    "destinationCity",
    "destinationProvince",
    "isAcceptingQuotes",
    "origin",
    "packageCount",
    "postedAt",
    "publicSummary",
    "shippingMode",
    "shippingPriority",
    "totalCbm",
    "totalWeightKg",
  ]);
  for (const forbidden of [
    "id",
    "requestId",
    "importerProfileId",
    "cargoDescription",
    "declaredValue",
    "destinationAddressDetails",
    "notes",
    "attachmentNotes",
    "attachments",
    "quotes",
  ]) {
    assert.equal(forbidden in record.request, false, forbidden);
  }

  for (const operation of [
    () =>
      enableRequestSharingForImporter(first.database, {
        requestId: fixture.requestId,
        importerProfileId: fixture.importerProfileId,
        publicSummary: "A changed summary that must not be accepted after closure.",
      }),
    () =>
      rotateRequestShareLinkForImporter(first.database, {
        requestId: fixture.requestId,
        importerProfileId: fixture.importerProfileId,
      }),
  ]) {
    await assert.rejects(
      operation,
      (error) => error instanceof RequestShareError && error.code === "not_posted",
    );
  }

  await disableRequestSharingForImporter(first.database, {
    requestId: fixture.requestId,
    importerProfileId: fixture.importerProfileId,
  });
});

test("draft activation fails and token collisions retry up to a unique value", async () => {
  const firstFixture = await createMarketplaceFixture({ createQuotes: false });
  const secondFixture = await createMarketplaceFixture({ createQuotes: false });
  await first.database
    .update(shipmentRequests)
    .set({ status: "draft" })
    .where(eq(shipmentRequests.id, secondFixture.requestId));
  await assert.rejects(
    enableRequestSharingForImporter(first.database, {
      requestId: secondFixture.requestId,
      importerProfileId: secondFixture.importerProfileId,
      publicSummary: "Draft requests must remain private until they are posted.",
    }),
    (error) => error instanceof RequestShareError && error.code === "not_posted",
  );

  const collisionToken = "AAAAAAAAAAAAAAAA";
  await enableRequestSharingForImporter(first.database, {
    requestId: firstFixture.requestId,
    importerProfileId: firstFixture.importerProfileId,
    publicSummary: "First request reserves the deterministic collision token.",
    generateToken: () => collisionToken,
  });
  await first.database
    .update(shipmentRequests)
    .set({ status: "posted" })
    .where(eq(shipmentRequests.id, secondFixture.requestId));

  const candidates = [collisionToken, collisionToken, "BBBBBBBBBBBBBBBB"];
  const enabled = await enableRequestSharingForImporter(first.database, {
    requestId: secondFixture.requestId,
    importerProfileId: secondFixture.importerProfileId,
    publicSummary: "Collision retries eventually use a unique public token.",
    generateToken: () => candidates.shift()!,
  });
  assert.equal(enabled.publicShareToken, "BBBBBBBBBBBBBBBB");
});

test("public viewer resolution distinguishes anonymous, onboarding, role, suspension, and quote states", async () => {
  const fixture = await createMarketplaceFixture();
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: null,
      profile: null,
    }),
    { kind: "anonymous" },
  );
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "clerk_without_profile",
      profile: null,
    }),
    { kind: "onboarding" },
  );
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "importer",
      profile: { id: fixture.importerUserProfileId, role: "importer" },
    }),
    { kind: "wrong_role", role: "importer" },
  );
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "admin",
      profile: { id: fixture.adminUserProfileId, role: "admin" },
    }),
    { kind: "wrong_role", role: "admin" },
  );
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "quoted_forwarder",
      profile: { id: fixture.forwarderUserProfileIds[0], role: "forwarder" },
    }),
    { kind: "forwarder_eligible", hasExistingQuote: true },
  );
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "unquoted_forwarder",
      profile: { id: fixture.forwarderUserProfileIds[2], role: "forwarder" },
    }),
    { kind: "forwarder_eligible", hasExistingQuote: false },
  );

  await first.database
    .update(forwarderCompanies)
    .set({ isSuspended: true })
    .where(eq(forwarderCompanies.id, fixture.companyIds[2]));
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "suspended_forwarder",
      profile: { id: fixture.forwarderUserProfileIds[2], role: "forwarder" },
    }),
    { kind: "forwarder_suspended" },
  );

  const [unaffiliated] = await first.database
    .insert(userProfiles)
    .values({
      clerkUserId: `test_unaffiliated_${crypto.randomUUID()}`,
      role: "forwarder",
      fullName: "Unaffiliated Forwarder",
    })
    .returning({ id: userProfiles.id });
  assert.deepEqual(
    await resolvePublicRequestViewer(first.database, {
      requestId: fixture.requestId,
      userId: "unaffiliated_forwarder",
      profile: { id: unaffiliated.id, role: "forwarder" },
    }),
    { kind: "forwarder_unavailable" },
  );
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
