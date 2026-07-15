import { and, count, eq, ne, sql } from "drizzle-orm";

import { db, type Database } from "@/db";
import {
  conversations,
  forwarderCompanies,
  quotes,
  shipmentRequests,
} from "@/db/schema";
import { getForwarderCompanyPublicProfileCompleteness } from "@/lib/forwarder-company-profile";
import { requireForwarderMember } from "@/lib/forwarder-open-requests";
import { notifyQuoteDecision, notifyQuoteSubmitted } from "@/lib/notifications";
import { requireImporterProfile } from "@/lib/shipment-requests";
import { runBestEffort } from "@/lib/best-effort";
import { consumeRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { logServerError } from "@/lib/server-log";
import {
  dateFromDateInput,
  quoteSubmissionSchemaForRequestMode,
} from "@/lib/validation";
import {
  findJourneyForEntity,
  recordFunnelEvent,
  recordRequestFunnelEvent,
} from "@/lib/funnel-events";

export class QuoteSubmissionError extends Error {
  constructor(
    readonly code:
      | "duplicate"
      | "request_unavailable"
      | "forwarder_suspended"
      | "profile_incomplete"
      | "not_found"
      | "invalid_status",
  ) {
    super(code);
  }
}

export class QuoteDecisionError extends Error {
  constructor(
    readonly code:
      | "not_found"
      | "invalid_status"
      | "expired"
      | "already_selected",
  ) {
    super(code);
  }
}

export const importerQuoteColumns = {
  id: quotes.id,
  shipmentRequestId: quotes.shipmentRequestId,
  status: quotes.status,
  quoteAmount: quotes.quoteAmount,
  currency: quotes.currency,
  shippingMode: quotes.shippingMode,
  serviceOffered: quotes.serviceOffered,
  estimatedTransitMinDays: quotes.estimatedTransitMinDays,
  estimatedTransitMaxDays: quotes.estimatedTransitMaxDays,
  inclusions: quotes.inclusions,
  exclusions: quotes.exclusions,
  notes: quotes.notes,
  validUntil: quotes.validUntil,
  isExpired: sql<boolean>`${quotes.validUntil} <= now()`,
  forwarderCompanyId: quotes.forwarderCompanyId,
  forwarderCompanyName: forwarderCompanies.name,
  createdAt: quotes.createdAt,
};

export const forwarderOwnQuoteColumns = {
  id: quotes.id,
  status: quotes.status,
  quoteAmount: quotes.quoteAmount,
  currency: quotes.currency,
  shippingMode: quotes.shippingMode,
  serviceOffered: quotes.serviceOffered,
  estimatedTransitMinDays: quotes.estimatedTransitMinDays,
  estimatedTransitMaxDays: quotes.estimatedTransitMaxDays,
  inclusions: quotes.inclusions,
  exclusions: quotes.exclusions,
  notes: quotes.notes,
  validUntil: quotes.validUntil,
  createdAt: quotes.createdAt,
};

export async function getImporterVisibleQuotesForOwnedRequest(
  requestId: string,
  importerProfileId: string,
) {
  return db
    .select(importerQuoteColumns)
    .from(quotes)
    .innerJoin(
      shipmentRequests,
      eq(quotes.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(quotes.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(
      and(
        eq(quotes.shipmentRequestId, requestId),
        eq(shipmentRequests.importerProfileId, importerProfileId),
      ),
    );
}

export async function getForwarderOwnQuoteForRequest(
  requestId: string,
  forwarderCompanyId: string,
) {
  const [quote] = await db
    .select(forwarderOwnQuoteColumns)
    .from(quotes)
    .where(
      and(
        eq(quotes.shipmentRequestId, requestId),
        eq(quotes.forwarderCompanyId, forwarderCompanyId),
      ),
    )
    .limit(1);

  return quote;
}

export async function getQuoteCountForRequest(requestId: string) {
  const [result] = await db
    .select({ quoteCount: count() })
    .from(quotes)
    .where(eq(quotes.shipmentRequestId, requestId));

  return result?.quoteCount ?? 0;
}

type QuoteMutationDatabase = Pick<Database, "transaction">;

export type QuoteDecisionInput = {
  requestId: string;
  quoteId: string;
};

export async function acceptQuoteForImporter(
  database: QuoteMutationDatabase,
  input: QuoteDecisionInput & { importerProfileId: string; now?: Date },
) {
  return database.transaction(async (tx) => {
    const [request] = await tx
      .select({ id: shipmentRequests.id, status: shipmentRequests.status })
      .from(shipmentRequests)
      .where(
        and(
          eq(shipmentRequests.id, input.requestId),
          eq(shipmentRequests.importerProfileId, input.importerProfileId),
        ),
      )
      .for("update")
      .limit(1);

    if (!request) {
      throw new QuoteDecisionError("not_found");
    }
    if (request.status === "quote_selected") {
      throw new QuoteDecisionError("already_selected");
    }
    if (request.status !== "posted") {
      throw new QuoteDecisionError("invalid_status");
    }

    const [target] = await tx
      .select({
        id: quotes.id,
        status: quotes.status,
        validUntil: quotes.validUntil,
      })
      .from(quotes)
      .where(
        and(
          eq(quotes.id, input.quoteId),
          eq(quotes.shipmentRequestId, input.requestId),
        ),
      )
      .limit(1);

    if (!target) {
      throw new QuoteDecisionError("not_found");
    }
    if (target.status !== "submitted") {
      throw new QuoteDecisionError("invalid_status");
    }

    const now = input.now ?? new Date();
    if (target.validUntil.getTime() <= now.getTime()) {
      throw new QuoteDecisionError("expired");
    }

    const [accepted] = await tx
      .update(quotes)
      .set({ status: "accepted", updatedAt: now })
      .where(
        and(eq(quotes.id, target.id), eq(quotes.status, "submitted")),
      )
      .returning({ id: quotes.id });

    if (!accepted) {
      throw new QuoteDecisionError("invalid_status");
    }

    const autoRejected = await tx
      .update(quotes)
      .set({ status: "rejected", updatedAt: now })
      .where(
        and(
          eq(quotes.shipmentRequestId, input.requestId),
          eq(quotes.status, "submitted"),
          ne(quotes.id, target.id),
        ),
      )
      .returning({ id: quotes.id });

    const [updatedRequest] = await tx
      .update(shipmentRequests)
      .set({ status: "quote_selected", updatedAt: now })
      .where(
        and(
          eq(shipmentRequests.id, input.requestId),
          eq(shipmentRequests.status, "posted"),
        ),
      )
      .returning({ id: shipmentRequests.id });

    if (!updatedRequest) {
      throw new QuoteDecisionError("already_selected");
    }

    return {
      requestId: input.requestId,
      acceptedQuoteId: accepted.id,
      autoRejectedQuoteIds: autoRejected.map((quote) => quote.id),
    };
  });
}

export async function acceptQuoteForCurrentImporter(input: QuoteDecisionInput) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.quoteMutation, profile.id);

  const result = await acceptQuoteForImporter(db, {
    ...input,
    importerProfileId: importerProfile.id,
  });

  const decisions = [
    { quoteId: result.acceptedQuoteId, decision: "accepted" as const },
    ...result.autoRejectedQuoteIds.map((quoteId) => ({
      quoteId,
      decision: "rejected" as const,
    })),
  ];
  await Promise.all(
    decisions.map(async ({ quoteId, decision }) => {
      try {
        await notifyQuoteDecision({
          quoteId,
          requestId: result.requestId,
          actorUserProfileId: profile.id,
          decision,
        });
      } catch (error) {
        logServerError("notification.quote_decision_failed", error, {
          requestId: result.requestId,
          quoteId,
        });
      }
    }),
  );

  return result;
}

export async function rejectQuoteForImporter(
  database: QuoteMutationDatabase,
  input: QuoteDecisionInput & { importerProfileId: string; now?: Date },
) {
  return database.transaction(async (tx) => {
    const [request] = await tx
      .select({ id: shipmentRequests.id, status: shipmentRequests.status })
      .from(shipmentRequests)
      .where(
        and(
          eq(shipmentRequests.id, input.requestId),
          eq(shipmentRequests.importerProfileId, input.importerProfileId),
        ),
      )
      .for("update")
      .limit(1);

    if (!request) throw new QuoteDecisionError("not_found");
    if (request.status !== "posted") {
      throw new QuoteDecisionError("invalid_status");
    }

    const [target] = await tx
      .select({ id: quotes.id, status: quotes.status })
      .from(quotes)
      .where(
        and(
          eq(quotes.id, input.quoteId),
          eq(quotes.shipmentRequestId, input.requestId),
        ),
      )
      .limit(1);

    if (!target) throw new QuoteDecisionError("not_found");
    if (target.status !== "submitted") {
      throw new QuoteDecisionError("invalid_status");
    }

    const [rejected] = await tx
      .update(quotes)
      .set({ status: "rejected", updatedAt: input.now ?? new Date() })
      .where(
        and(eq(quotes.id, target.id), eq(quotes.status, "submitted")),
      )
      .returning({ id: quotes.id });

    if (!rejected) throw new QuoteDecisionError("invalid_status");
    return { requestId: request.id, rejectedQuoteId: rejected.id };
  });
}

export async function rejectQuoteForCurrentImporter(input: QuoteDecisionInput) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.quoteMutation, profile.id);

  const result = await rejectQuoteForImporter(db, {
    ...input,
    importerProfileId: importerProfile.id,
  });

  await runBestEffort(
    "notification.quote_decision_failed",
    () =>
      notifyQuoteDecision({
        quoteId: result.rejectedQuoteId,
        requestId: result.requestId,
        actorUserProfileId: profile.id,
        decision: "rejected",
      }),
    { requestId: result.requestId, quoteId: result.rejectedQuoteId },
  );

  return result;
}

export async function updateQuoteForForwarder(
  database: QuoteMutationDatabase,
  input: QuoteDecisionInput & {
    forwarderCompanyId: string;
    quoteInput: unknown;
    now?: Date;
  },
) {
  return database.transaction(async (tx) => {
    const [request] = await tx
      .select({
        id: shipmentRequests.id,
        status: shipmentRequests.status,
        shippingModePreference: shipmentRequests.shippingModePreference,
      })
      .from(shipmentRequests)
      .where(eq(shipmentRequests.id, input.requestId))
      .for("update")
      .limit(1);

    if (!request) throw new QuoteSubmissionError("not_found");
    const [ownedQuote] = await tx
      .select({ id: quotes.id, status: quotes.status })
      .from(quotes)
      .where(
        and(
          eq(quotes.id, input.quoteId),
          eq(quotes.shipmentRequestId, input.requestId),
          eq(quotes.forwarderCompanyId, input.forwarderCompanyId),
        ),
      )
      .limit(1);

    if (!ownedQuote) throw new QuoteSubmissionError("not_found");
    if (ownedQuote.status !== "submitted" || request.status !== "posted") {
      throw new QuoteSubmissionError("invalid_status");
    }

    const parsed = quoteSubmissionSchemaForRequestMode(
      request.shippingModePreference,
    ).parse(input.quoteInput);
    const [quote] = await tx
      .update(quotes)
      .set({
        quoteAmount: parsed.quoteAmount,
        currency: parsed.currency,
        shippingMode: parsed.shippingMode,
        serviceOffered: parsed.serviceOffered,
        estimatedTransitMinDays: parsed.estimatedTransitMinDays,
        estimatedTransitMaxDays: parsed.estimatedTransitMaxDays,
        inclusions: parsed.inclusions ?? "",
        exclusions: parsed.exclusions ?? "",
        notes: parsed.notes,
        validUntil: dateFromDateInput(parsed.validUntil),
        updatedAt: input.now ?? new Date(),
      })
      .where(and(eq(quotes.id, ownedQuote.id), eq(quotes.status, "submitted")))
      .returning({ id: quotes.id, requestId: quotes.shipmentRequestId });
    return quote;
  });
}

export async function updateQuoteForCurrentForwarder(
  target: QuoteDecisionInput,
  input: unknown,
) {
  const { profile, member } = await requireForwarderMember();
  await consumeRateLimit(rateLimitPolicies.quoteMutation, profile.id);

  if (member.companyIsSuspended) {
    throw new QuoteSubmissionError("forwarder_suspended");
  }

  return updateQuoteForForwarder(db, {
    ...target,
    forwarderCompanyId: member.companyId,
    quoteInput: input,
  });
}

export async function withdrawQuoteForForwarder(
  database: QuoteMutationDatabase,
  input: QuoteDecisionInput & { forwarderCompanyId: string; now?: Date },
) {
  return database.transaction(async (tx) => {
    const [request] = await tx
      .select({ id: shipmentRequests.id, status: shipmentRequests.status })
      .from(shipmentRequests)
      .where(eq(shipmentRequests.id, input.requestId))
      .for("update")
      .limit(1);
    if (!request || request.status !== "posted") return undefined;

    const [quote] = await tx
      .update(quotes)
      .set({ status: "withdrawn", updatedAt: input.now ?? new Date() })
      .where(
        and(
          eq(quotes.id, input.quoteId),
          eq(quotes.shipmentRequestId, input.requestId),
          eq(quotes.forwarderCompanyId, input.forwarderCompanyId),
          eq(quotes.status, "submitted"),
        ),
      )
      .returning({ id: quotes.id, requestId: quotes.shipmentRequestId });
    return quote;
  });
}

export async function withdrawQuoteForCurrentForwarder(input: QuoteDecisionInput) {
  const { profile, member } = await requireForwarderMember();
  await consumeRateLimit(rateLimitPolicies.quoteMutation, profile.id);
  return withdrawQuoteForForwarder(db, {
    ...input,
    forwarderCompanyId: member.companyId,
  });
}

export async function createQuoteForForwarder(
  database: QuoteMutationDatabase,
  input: {
    requestId: string;
    forwarderCompanyId: string;
    forwarderMemberId: string;
    quoteInput: unknown;
  },
) {
  let quote: { id: string };
  try {
    quote = await database.transaction(async (tx) => {
      const [company] = await tx
        .select({
          name: forwarderCompanies.name,
          slug: forwarderCompanies.slug,
          shippingModes: forwarderCompanies.shippingModes,
          originCities: forwarderCompanies.originCities,
          destinationAreas: forwarderCompanies.destinationAreas,
          serviceDescription: forwarderCompanies.serviceDescription,
          isSuspended: forwarderCompanies.isSuspended,
        })
        .from(forwarderCompanies)
        .where(eq(forwarderCompanies.id, input.forwarderCompanyId))
        .for("update")
        .limit(1);

      if (!company) {
        throw new QuoteSubmissionError("not_found");
      }
      if (company.isSuspended) {
        throw new QuoteSubmissionError("forwarder_suspended");
      }
      if (!getForwarderCompanyPublicProfileCompleteness(company).isComplete) {
        throw new QuoteSubmissionError("profile_incomplete");
      }

      const [request] = await tx
        .select({
          id: shipmentRequests.id,
          importerProfileId: shipmentRequests.importerProfileId,
          status: shipmentRequests.status,
          shippingModePreference: shipmentRequests.shippingModePreference,
        })
        .from(shipmentRequests)
        .where(eq(shipmentRequests.id, input.requestId))
        .for("update")
        .limit(1);

      if (!request || request.status !== "posted") {
        throw new QuoteSubmissionError("request_unavailable");
      }

      const parsed = quoteSubmissionSchemaForRequestMode(
        request.shippingModePreference,
      ).parse(input.quoteInput);
      const [created] = await tx
        .insert(quotes)
        .values({
          shipmentRequestId: input.requestId,
          forwarderCompanyId: input.forwarderCompanyId,
          submittedByForwarderMemberId: input.forwarderMemberId,
          status: "submitted",
          quoteAmount: parsed.quoteAmount,
          currency: parsed.currency,
          shippingMode: parsed.shippingMode,
          serviceOffered: parsed.serviceOffered,
          estimatedTransitMinDays: parsed.estimatedTransitMinDays,
          estimatedTransitMaxDays: parsed.estimatedTransitMaxDays,
          inclusions: parsed.inclusions ?? "",
          exclusions: parsed.exclusions ?? "",
          notes: parsed.notes,
          validUntil: dateFromDateInput(parsed.validUntil),
        })
        .returning({ id: quotes.id });

      const [conversation] = await tx
        .insert(conversations)
        .values({
          shipmentRequestId: request.id,
          importerProfileId: request.importerProfileId,
          forwarderCompanyId: input.forwarderCompanyId,
          openedByQuoteId: created.id,
        })
        .returning({ id: conversations.id });

      return { ...created, conversationId: conversation.id };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new QuoteSubmissionError("duplicate");
    }
    throw error;
  }

  return quote;
}

export async function createQuoteForCurrentForwarder(
  requestId: string,
  input: unknown,
) {
  const { profile, member } = await requireForwarderMember();

  if (member.companyIsSuspended) {
    throw new QuoteSubmissionError("forwarder_suspended");
  }

  const readiness = getForwarderCompanyPublicProfileCompleteness({
    name: member.companyName,
    slug: member.companySlug,
    shippingModes: member.companyShippingModes,
    originCities: member.companyOriginCities,
    destinationAreas: member.companyDestinationAreas,
    serviceDescription: member.companyServiceDescription,
  });

  if (!readiness.isComplete) {
    throw new QuoteSubmissionError("profile_incomplete");
  }

  await consumeRateLimit(rateLimitPolicies.quoteMutation, profile.id);

  const quote = await createQuoteForForwarder(db, {
    requestId,
    forwarderCompanyId: member.companyId,
    forwarderMemberId: member.id,
    quoteInput: input,
  });

  await runBestEffort(
    "notification.quote_submitted_failed",
    () =>
      notifyQuoteSubmitted({
        quoteId: quote.id,
        requestId,
        actorUserProfileId: profile.id,
      }),
    { requestId, quoteId: quote.id },
  );

  await runBestEffort(
    "funnel.quote_submitted_failed",
    () =>
      recordRequestFunnelEvent({
        eventName: "quote_submitted",
        userProfileId: profile.id,
        role: "forwarder",
        entityType: "quote",
        entityId: quote.id,
      }),
    { requestId, quoteId: quote.id },
  );

  await runBestEffort(
    "funnel.quote_received_failed",
    async () => {
      const importerJourneyId = await findJourneyForEntity({
        eventName: "request_posted",
        entityType: "shipment_request",
        entityId: requestId,
      });
      if (!importerJourneyId) return;
      await recordFunnelEvent({
        journeyId: importerJourneyId,
        eventName: "quote_received",
        role: "importer",
        entityType: "quote",
        entityId: quote.id,
      });
    },
    { requestId, quoteId: quote.id },
  );

  return quote;
}

function isUniqueViolation(error: unknown) {
  let current = error;
  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== "object" || current === null) return false;
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}
