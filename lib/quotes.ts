import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  forwarderCompanies,
  quotes,
  shipmentRequests,
} from "@/db/schema";
import { requireForwarderMember } from "@/lib/forwarder-open-requests";
import { notifyQuoteDecision, notifyQuoteSubmitted } from "@/lib/notifications";
import { requireImporterProfile } from "@/lib/shipment-requests";

export class QuoteSubmissionError extends Error {
  constructor(
    readonly code: "duplicate" | "request_unavailable" | "forwarder_suspended",
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

const optionalLongText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => value || undefined);

export const quoteSubmissionSchema = z
  .object({
    quoteAmount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount."),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .default("PHP")
      .pipe(z.literal("PHP")),
    serviceOffered: z.string().trim().min(3).max(240),
    estimatedTransitMinDays: z.coerce.number().int().min(1).max(365),
    estimatedTransitMaxDays: z.coerce.number().int().min(1).max(365),
    inclusions: z.string().trim().min(1).max(2000),
    exclusions: z.string().trim().min(1).max(2000),
    notes: optionalLongText,
    validUntil: z.coerce.date(),
  })
  .refine(
    (input) =>
      input.estimatedTransitMaxDays >= input.estimatedTransitMinDays,
    {
      message: "Maximum transit days must be greater than or equal to minimum.",
      path: ["estimatedTransitMaxDays"],
    },
  )
  .refine((input) => input.validUntil.getTime() > Date.now(), {
    message: "Quote validity must be in the future.",
    path: ["validUntil"],
  });

export type QuoteSubmissionInput = z.infer<typeof quoteSubmissionSchema>;

export function quoteSubmissionInputFromFormData(formData: FormData) {
  return {
    quoteAmount: formData.get("quoteAmount"),
    currency: formData.get("currency") || "PHP",
    serviceOffered: formData.get("serviceOffered"),
    estimatedTransitMinDays: formData.get("estimatedTransitMinDays"),
    estimatedTransitMaxDays: formData.get("estimatedTransitMaxDays"),
    inclusions: formData.get("inclusions"),
    exclusions: formData.get("exclusions"),
    notes: formData.get("notes"),
    validUntil: formData.get("validUntil"),
  };
}

export const importerQuoteColumns = {
  id: quotes.id,
  status: quotes.status,
  quoteAmount: quotes.quoteAmount,
  currency: quotes.currency,
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

export async function acceptQuoteForCurrentImporter(quoteId: string) {
  const { profile, importerProfile } = await requireImporterProfile();

  const result = await db.transaction(async (tx) => {
    const [target] = await tx
      .select({
        id: quotes.id,
        status: quotes.status,
        validUntil: quotes.validUntil,
        requestId: shipmentRequests.id,
        requestStatus: shipmentRequests.status,
      })
      .from(quotes)
      .innerJoin(
        shipmentRequests,
        eq(quotes.shipmentRequestId, shipmentRequests.id),
      )
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(shipmentRequests.importerProfileId, importerProfile.id),
        ),
      )
      .limit(1);

    if (!target) {
      throw new QuoteDecisionError("not_found");
    }

    if (target.status !== "submitted") {
      throw new QuoteDecisionError("invalid_status");
    }

    if (target.validUntil.getTime() <= Date.now()) {
      throw new QuoteDecisionError("expired");
    }

    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${target.requestId}))`);

    const [alreadyAccepted] = await tx
      .select({ id: quotes.id })
      .from(quotes)
      .where(
        and(
          eq(quotes.shipmentRequestId, target.requestId),
          eq(quotes.status, "accepted"),
        ),
      )
      .limit(1);

    if (alreadyAccepted) {
      throw new QuoteDecisionError("already_selected");
    }

    const now = new Date();

    await tx
      .update(quotes)
      .set({ status: "accepted", updatedAt: now })
      .where(eq(quotes.id, target.id));

    await tx
      .update(shipmentRequests)
      .set({ status: "quote_selected", updatedAt: now })
      .where(eq(shipmentRequests.id, target.requestId));

    return { requestId: target.requestId };
  });

  await notifyQuoteDecision({
    quoteId,
    requestId: result.requestId,
    actorUserProfileId: profile.id,
    decision: "accepted",
  });

  return result;
}

export async function rejectQuoteForCurrentImporter(quoteId: string) {
  const { profile, importerProfile } = await requireImporterProfile();

  const result = await db.transaction(async (tx) => {
    const [target] = await tx
      .select({
        id: quotes.id,
        status: quotes.status,
        requestId: shipmentRequests.id,
      })
      .from(quotes)
      .innerJoin(
        shipmentRequests,
        eq(quotes.shipmentRequestId, shipmentRequests.id),
      )
      .where(
        and(
          eq(quotes.id, quoteId),
          eq(shipmentRequests.importerProfileId, importerProfile.id),
        ),
      )
      .limit(1);

    if (!target) {
      throw new QuoteDecisionError("not_found");
    }

    if (target.status !== "submitted") {
      throw new QuoteDecisionError("invalid_status");
    }

    await tx
      .update(quotes)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(quotes.id, target.id));

    return { requestId: target.requestId };
  });

  await notifyQuoteDecision({
    quoteId,
    requestId: result.requestId,
    actorUserProfileId: profile.id,
    decision: "rejected",
  });

  return result;
}

export async function createQuoteForCurrentForwarder(
  requestId: string,
  input: unknown,
) {
  const { profile, member } = await requireForwarderMember();
  const parsed = quoteSubmissionSchema.parse(input);

  if (member.companyIsSuspended) {
    throw new QuoteSubmissionError("forwarder_suspended");
  }

  const [request] = await db
    .select({ id: shipmentRequests.id })
    .from(shipmentRequests)
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.status, "posted"),
      ),
    )
    .limit(1);

  if (!request) {
    throw new QuoteSubmissionError("request_unavailable");
  }

  const existingQuote = await getForwarderOwnQuoteForRequest(
    requestId,
    member.companyId,
  );

  if (existingQuote) {
    throw new QuoteSubmissionError("duplicate");
  }

  const [quote] = await db
    .insert(quotes)
    .values({
      shipmentRequestId: requestId,
      forwarderCompanyId: member.companyId,
      submittedByForwarderMemberId: member.id,
      status: "submitted",
      quoteAmount: parsed.quoteAmount,
      currency: parsed.currency,
      serviceOffered: parsed.serviceOffered,
      estimatedTransitMinDays: parsed.estimatedTransitMinDays,
      estimatedTransitMaxDays: parsed.estimatedTransitMaxDays,
      inclusions: parsed.inclusions,
      exclusions: parsed.exclusions,
      notes: parsed.notes,
      validUntil: parsed.validUntil,
    })
    .returning({ id: quotes.id });

  await notifyQuoteSubmitted({
    quoteId: quote.id,
    requestId,
    actorUserProfileId: profile.id,
  });

  return quote;
}
