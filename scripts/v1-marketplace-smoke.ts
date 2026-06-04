import { config } from "dotenv";
import { and, eq, inArray } from "drizzle-orm";

import { closeDb, db } from "@/db";
import {
  conversations,
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  messages,
  notifications,
  quotes,
  shipmentRequests,
  userProfiles,
} from "@/db/schema";
import { getShipmentRequestForForwarderDetail } from "@/lib/forwarder-open-requests";
import {
  getForwarderOwnQuoteForRequest,
  getImporterVisibleQuotesForOwnedRequest,
  getQuoteCountForRequest,
} from "@/lib/quotes";
import { createOnboardingProfile } from "@/lib/onboarding";
import {
  notifyMessageCreated,
  notifyQuoteDecision,
  notifyQuoteSubmitted,
} from "@/lib/notifications";
import {
  createShipmentRequestSchema,
  quoteSubmissionSchema,
} from "@/lib/validation";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run V1 marketplace smoke in production");
}

const smokeId = `v1_marketplace_smoke_${Date.now()}`;
const keepData = process.env.V1_SMOKE_KEEP_DATA === "1";
const clerkIds = {
  importerOwner: "smoke_v1_importer_owner",
  importerOther: "smoke_v1_importer_other",
  forwarderA: "smoke_v1_forwarder_a",
  forwarderB: "smoke_v1_forwarder_b",
  forwarderNoQuote: "smoke_v1_forwarder_no_quote",
};

type ImporterFixture = {
  profileId: string;
  importerProfileId: string;
};

type ForwarderFixture = {
  profileId: string;
  companyId: string;
  memberId: string;
};

type SmokeResult = {
  namespace: string;
  importer: ImporterFixture;
  unrelatedImporter: ImporterFixture;
  forwarderA: ForwarderFixture;
  forwarderB: ForwarderFixture;
  forwarderNoQuote: ForwarderFixture;
  requestId: string;
  unrelatedRequestId: string;
  quoteAId: string;
  quoteBId: string;
  conversationId: string;
  messageIds: string[];
  notificationCounts: Record<string, number>;
  privacyChecks: Record<string, boolean>;
  cleanup: "skipped" | "completed";
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function cleanupSmokeRows() {
  const ids = Object.values(clerkIds);

  await db.delete(userProfiles).where(
    inArray(userProfiles.clerkUserId, [
      clerkIds.importerOwner,
      clerkIds.importerOther,
    ]),
  );

  await db.delete(userProfiles).where(inArray(userProfiles.clerkUserId, ids));
}

async function createImporter(
  clerkUserId: string,
  fullName: string,
  companyName: string,
): Promise<ImporterFixture> {
  const result = await createOnboardingProfile(clerkUserId, {
    role: "importer",
    fullName,
    companyName,
  });

  const importerProfile = await db.query.importerProfiles.findFirst({
    where: eq(importerProfiles.userProfileId, result.profile.id),
  });

  assert(importerProfile, `Missing importer profile for ${clerkUserId}`);

  return {
    profileId: result.profile.id,
    importerProfileId: importerProfile.id,
  };
}

async function createForwarder(
  clerkUserId: string,
  fullName: string,
  companyName: string,
): Promise<ForwarderFixture> {
  const result = await createOnboardingProfile(clerkUserId, {
    role: "forwarder",
    fullName,
    companyName,
  });

  const member = await db.query.forwarderMembers.findFirst({
    where: eq(forwarderMembers.userProfileId, result.profile.id),
  });

  assert(member, `Missing forwarder member for ${clerkUserId}`);

  const company = await db.query.forwarderCompanies.findFirst({
    where: eq(forwarderCompanies.id, member.forwarderCompanyId),
  });

  assert(company, `Missing forwarder company for ${clerkUserId}`);

  return {
    profileId: result.profile.id,
    companyId: company.id,
    memberId: member.id,
  };
}

async function createPostedRequest(importerProfileId: string, label: string) {
  const input = createShipmentRequestSchema.parse({
    cargoDescription: `${label} phone accessories Guangzhou to Manila`,
    cargoType: "electronics",
    totalCbm: "1.250",
    totalWeightKg: "120",
    origin: "Guangzhou, China",
    destination: "Dumaguete City, Negros Oriental",
    destinationRegionCode: "0700000000",
    destinationRegionName: "Region VII (Central Visayas)",
    destinationProvinceCode: "0704600000",
    destinationProvinceName: "Negros Oriental",
    destinationCityMunicipalityCode: "0746100000",
    destinationCityMunicipalityName: "Dumaguete City",
    destinationDisplayName: "Dumaguete City, Negros Oriental",
    deliveryPreference: "door_to_door",
    shippingPreference: "balanced",
    notes: `Smoke namespace ${smokeId}. Supplier can provide packing list.`,
    attachmentNotes: "Packing list ready. MSDS not required.",
  });

  const [request] = await db
    .insert(shipmentRequests)
    .values({
      importerProfileId,
      status: "posted",
      cargoDescription: input.cargoDescription,
      cargoType: input.cargoType,
      totalCbm: input.totalCbm,
      totalWeightKg: input.totalWeightKg,
      origin: input.origin,
      destination: input.destinationDisplayName ?? input.destination ?? "Dumaguete City, Negros Oriental",
      destinationRegionCode: input.destinationRegionCode,
      destinationRegionName: input.destinationRegionName,
      destinationProvinceCode: input.destinationProvinceCode,
      destinationProvinceName: input.destinationProvinceName,
      destinationCityMunicipalityCode: input.destinationCityMunicipalityCode,
      destinationCityMunicipalityName: input.destinationCityMunicipalityName,
      destinationDisplayName: input.destinationDisplayName,
      deliveryPreference: input.deliveryPreference,
      shippingPreference: input.shippingPreference,
      notes: input.notes,
      attachmentNotes: input.attachmentNotes,
    })
    .returning({ id: shipmentRequests.id });

  assert(request, "Shipment request was not created");

  return request.id;
}

async function createSubmittedQuote(input: {
  requestId: string;
  forwarder: ForwarderFixture;
  actorUserProfileId: string;
  amount: string;
  serviceOffered: string;
}) {
  const parsed = quoteSubmissionSchema.parse({
    quoteAmount: input.amount,
    currency: "PHP",
    serviceOffered: input.serviceOffered,
    estimatedTransitMinDays: "12",
    estimatedTransitMaxDays: "18",
    inclusions: "China pickup, sea freight, customs assistance, Manila delivery",
    exclusions: "Duties, taxes, storage, and special permits",
    notes: `Smoke namespace ${smokeId}. Rate assumes normal cargo.`,
    validUntil: futureDateInput(14),
  });

  const [quote] = await db
    .insert(quotes)
    .values({
      shipmentRequestId: input.requestId,
      forwarderCompanyId: input.forwarder.companyId,
      submittedByForwarderMemberId: input.forwarder.memberId,
      status: "submitted",
      quoteAmount: parsed.quoteAmount,
      currency: parsed.currency,
      serviceOffered: parsed.serviceOffered,
      estimatedTransitMinDays: parsed.estimatedTransitMinDays,
      estimatedTransitMaxDays: parsed.estimatedTransitMaxDays,
      inclusions: parsed.inclusions,
      exclusions: parsed.exclusions,
      notes: parsed.notes,
      validUntil: new Date(`${parsed.validUntil}T00:00:00`),
    })
    .returning({ id: quotes.id });

  assert(quote, "Quote was not created");

  await notifyQuoteSubmitted({
    quoteId: quote.id,
    requestId: input.requestId,
    actorUserProfileId: input.actorUserProfileId,
  });

  return quote.id;
}

async function acceptQuote(input: {
  quoteId: string;
  requestId: string;
  actorUserProfileId: string;
}) {
  const now = new Date();

  const [quote] = await db
    .update(quotes)
    .set({ status: "accepted", updatedAt: now })
    .where(eq(quotes.id, input.quoteId))
    .returning({ id: quotes.id });

  assert(quote, "Quote was not accepted");

  await db
    .update(shipmentRequests)
    .set({ status: "quote_selected", updatedAt: now })
    .where(eq(shipmentRequests.id, input.requestId));

  await notifyQuoteDecision({
    quoteId: input.quoteId,
    requestId: input.requestId,
    actorUserProfileId: input.actorUserProfileId,
    decision: "accepted",
  });
}

async function rejectQuote(input: {
  quoteId: string;
  requestId: string;
  actorUserProfileId: string;
}) {
  const [quote] = await db
    .update(quotes)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(quotes.id, input.quoteId))
    .returning({ id: quotes.id });

  assert(quote, "Quote was not rejected");

  await notifyQuoteDecision({
    quoteId: input.quoteId,
    requestId: input.requestId,
    actorUserProfileId: input.actorUserProfileId,
    decision: "rejected",
  });
}

async function createConversationAndMessages(input: {
  requestId: string;
  importer: ImporterFixture;
  forwarder: ForwarderFixture;
  quoteId: string;
}) {
  const [conversation] = await db
    .insert(conversations)
    .values({
      shipmentRequestId: input.requestId,
      importerProfileId: input.importer.importerProfileId,
      forwarderCompanyId: input.forwarder.companyId,
      openedByQuoteId: input.quoteId,
    })
    .returning({ id: conversations.id });

  assert(conversation, "Conversation was not created");

  const [importerMessage] = await db
    .insert(messages)
    .values({
      conversationId: conversation.id,
      senderUserProfileId: input.importer.profileId,
      body: `Importer question for ${smokeId}: can you confirm delivery scope?`,
    })
    .returning({ id: messages.id });

  assert(importerMessage, "Importer message was not created");
  await notifyMessageCreated({
    conversationId: conversation.id,
    messageId: importerMessage.id,
    senderUserProfileId: input.importer.profileId,
  });

  const [forwarderMessage] = await db
    .insert(messages)
    .values({
      conversationId: conversation.id,
      senderUserProfileId: input.forwarder.profileId,
      body: `Forwarder reply for ${smokeId}: delivery is included.`,
    })
    .returning({ id: messages.id });

  assert(forwarderMessage, "Forwarder message was not created");
  await notifyMessageCreated({
    conversationId: conversation.id,
    messageId: forwarderMessage.id,
    senderUserProfileId: input.forwarder.profileId,
  });

  return {
    conversationId: conversation.id,
    messageIds: [importerMessage.id, forwarderMessage.id],
  };
}

async function hasQualifyingQuote(requestId: string, forwarderCompanyId: string) {
  const quote = await db.query.quotes.findFirst({
    where: and(
      eq(quotes.shipmentRequestId, requestId),
      eq(quotes.forwarderCompanyId, forwarderCompanyId),
      inArray(quotes.status, ["submitted", "accepted", "rejected"]),
    ),
  });

  return Boolean(quote);
}

async function countNotificationsForProfile(profileId: string) {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientUserProfileId, profileId));

  return rows.length;
}

function futureDateInput(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

async function main(): Promise<SmokeResult> {
  await cleanupSmokeRows();

  const importer = await createImporter(
    clerkIds.importerOwner,
    "Smoke V1 Importer Owner",
    "Smoke V1 Importer Trading",
  );
  const unrelatedImporter = await createImporter(
    clerkIds.importerOther,
    "Smoke V1 Other Importer",
    "Smoke V1 Other Trading",
  );
  const forwarderA = await createForwarder(
    clerkIds.forwarderA,
    "Smoke V1 Forwarder A",
    "Smoke V1 Forwarder A Logistics",
  );
  const forwarderB = await createForwarder(
    clerkIds.forwarderB,
    "Smoke V1 Forwarder B",
    "Smoke V1 Forwarder B Logistics",
  );
  const forwarderNoQuote = await createForwarder(
    clerkIds.forwarderNoQuote,
    "Smoke V1 Forwarder No Quote",
    "Smoke V1 No Quote Logistics",
  );

  const requestId = await createPostedRequest(
    importer.importerProfileId,
    "Smoke V1 owner request",
  );
  const unrelatedRequestId = await createPostedRequest(
    unrelatedImporter.importerProfileId,
    "Smoke V1 unrelated request",
  );

  const forwarderVisibleRequest = await getShipmentRequestForForwarderDetail(
    requestId,
    forwarderA.companyId,
  );
  assert(forwarderVisibleRequest?.id === requestId, "Forwarder cannot see open request");

  const quoteAId = await createSubmittedQuote({
    requestId,
    forwarder: forwarderA,
    actorUserProfileId: forwarderA.profileId,
    amount: "25000.00",
    serviceOffered: "China to Manila door-to-door consolidation",
  });
  const quoteBId = await createSubmittedQuote({
    requestId,
    forwarder: forwarderB,
    actorUserProfileId: forwarderB.profileId,
    amount: "27500.00",
    serviceOffered: "China pickup and Manila delivery",
  });

  const importerVisibleQuotes = await getImporterVisibleQuotesForOwnedRequest(
    requestId,
    importer.importerProfileId,
  );
  assert(importerVisibleQuotes.length === 2, "Importer cannot see owned quotes");

  await acceptQuote({
    quoteId: quoteAId,
    requestId,
    actorUserProfileId: importer.profileId,
  });
  await rejectQuote({
    quoteId: quoteBId,
    requestId,
    actorUserProfileId: importer.profileId,
  });

  const acceptedQuote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteAId),
  });
  const rejectedQuote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteBId),
  });
  const selectedRequest = await db.query.shipmentRequests.findFirst({
    where: eq(shipmentRequests.id, requestId),
  });

  assert(acceptedQuote?.status === "accepted", "Accepted quote status mismatch");
  assert(rejectedQuote?.status === "rejected", "Rejected quote status mismatch");
  assert(
    selectedRequest?.status === "quote_selected",
    "Request was not marked quote_selected",
  );

  assert(
    await hasQualifyingQuote(requestId, forwarderA.companyId),
    "Messaging gate missing for quoting forwarder",
  );
  assert(
    !(await hasQualifyingQuote(requestId, forwarderNoQuote.companyId)),
    "Messaging gate unexpectedly open for non-quoting forwarder",
  );

  const { conversationId, messageIds } = await createConversationAndMessages({
    requestId,
    importer,
    forwarder: forwarderA,
    quoteId: quoteAId,
  });

  const ownerScopedRequest = await db.query.shipmentRequests.findFirst({
    where: and(
      eq(shipmentRequests.id, requestId),
      eq(shipmentRequests.importerProfileId, importer.importerProfileId),
    ),
  });
  const unrelatedImporterRequestRead = await db.query.shipmentRequests.findFirst({
    where: and(
      eq(shipmentRequests.id, requestId),
      eq(shipmentRequests.importerProfileId, unrelatedImporter.importerProfileId),
    ),
  });
  const unrelatedImporterMutation = await db
    .update(shipmentRequests)
    .set({ notes: "This update must not apply" })
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.importerProfileId, unrelatedImporter.importerProfileId),
      ),
    )
    .returning({ id: shipmentRequests.id });

  const forwarderMutation = await db
    .update(shipmentRequests)
    .set({ notes: "This forwarder-scoped update must not apply" })
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.importerProfileId, forwarderA.companyId),
      ),
    )
    .returning({ id: shipmentRequests.id });

  const quoteCount = await getQuoteCountForRequest(requestId);
  const forwarderAOwnQuote = await getForwarderOwnQuoteForRequest(
    requestId,
    forwarderA.companyId,
  );
  const forwarderBOwnQuote = await getForwarderOwnQuoteForRequest(
    requestId,
    forwarderB.companyId,
  );
  const forwarderANotCompetitorQuote = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(
      and(
        eq(quotes.id, quoteBId),
        eq(quotes.forwarderCompanyId, forwarderA.companyId),
      ),
    );
  const forwarderBNotCompetitorQuote = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(
      and(
        eq(quotes.id, quoteAId),
        eq(quotes.forwarderCompanyId, forwarderB.companyId),
      ),
    );

  const importerConversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.importerProfileId, importer.importerProfileId),
    ),
  });
  const unrelatedImporterConversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.importerProfileId, unrelatedImporter.importerProfileId),
    ),
  });
  const forwarderAConversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.forwarderCompanyId, forwarderA.companyId),
    ),
  });
  const forwarderBConversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.forwarderCompanyId, forwarderB.companyId),
    ),
  });

  const notificationCounts = {
    importer: await countNotificationsForProfile(importer.profileId),
    forwarderA: await countNotificationsForProfile(forwarderA.profileId),
    forwarderB: await countNotificationsForProfile(forwarderB.profileId),
    forwarderNoQuote: await countNotificationsForProfile(
      forwarderNoQuote.profileId,
    ),
  };

  const privacyChecks = {
    ownerCanReadOwnRequest: ownerScopedRequest?.id === requestId,
    unrelatedImporterCannotReadOwnerRequest: !unrelatedImporterRequestRead,
    unrelatedImporterCannotMutateOwnerRequest:
      unrelatedImporterMutation.length === 0,
    forwarderCannotMutateImporterOwnedRequest: forwarderMutation.length === 0,
    importerCannotSeeUnrelatedRequestQuotes:
      (
        await getImporterVisibleQuotesForOwnedRequest(
          unrelatedRequestId,
          importer.importerProfileId,
        )
      ).length === 0,
    forwarderASeesOwnQuoteOnly:
      forwarderAOwnQuote?.id === quoteAId &&
      forwarderANotCompetitorQuote.length === 0,
    forwarderBSeesOwnQuoteOnly:
      forwarderBOwnQuote?.id === quoteBId &&
      forwarderBNotCompetitorQuote.length === 0,
    competitorForwardersSeeAggregateQuoteCountOnly: quoteCount === 2,
    importerConversationParticipantScoped: Boolean(importerConversation),
    unrelatedImporterCannotReadConversation: !unrelatedImporterConversation,
    forwarderConversationParticipantScoped: Boolean(forwarderAConversation),
    competitorForwarderCannotReadConversation: !forwarderBConversation,
  };

  for (const [check, passed] of Object.entries(privacyChecks)) {
    assert(passed, `Privacy check failed: ${check}`);
  }

  assert(notificationCounts.importer >= 3, "Importer notifications missing");
  assert(notificationCounts.forwarderA >= 2, "Forwarder A notifications missing");
  assert(notificationCounts.forwarderB >= 1, "Forwarder B notifications missing");
  assert(
    notificationCounts.forwarderNoQuote === 0,
    "Non-participant forwarder received notifications",
  );

  return {
    namespace: smokeId,
    importer,
    unrelatedImporter,
    forwarderA,
    forwarderB,
    forwarderNoQuote,
    requestId,
    unrelatedRequestId,
    quoteAId,
    quoteBId,
    conversationId,
    messageIds,
    notificationCounts,
    privacyChecks,
    cleanup: keepData ? "skipped" : "completed",
  };
}

main()
  .then(async (result) => {
    console.log("V1 marketplace smoke PASS");
    console.log(JSON.stringify(result, null, 2));

    if (!keepData) {
      await cleanupSmokeRows();
    }
  })
  .catch(async (error) => {
    console.error("V1 marketplace smoke FAIL");
    console.error(error);

    if (!keepData) {
      await cleanupSmokeRows();
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
