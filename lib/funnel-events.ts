import { randomUUID } from "node:crypto";

import { and, countDistinct, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

import { db, type Database } from "@/db";
import { funnelEvents, type UserRole } from "@/db/schema";
import {
  normalizeAuthRedirectIntent,
  type AuthRedirectIntent,
} from "@/lib/auth-redirect";
import { requireAdmin } from "@/lib/admin";

export const funnelEventNames = [
  "auth_started",
  "onboarding_completed",
  "request_started",
  "request_posted",
  "forwarder_profile_ready",
  "quote_started",
  "quote_submitted",
  "quote_received",
  "quote_accepted",
  "first_message_sent",
] as const;

export const funnelEventNameSchema = z.enum(funnelEventNames);
export type FunnelEventName = z.infer<typeof funnelEventNameSchema>;

export const pageEntryFunnelEventNames = [
  "auth_started",
  "request_started",
  "quote_started",
] as const satisfies readonly FunnelEventName[];

export const pageEntryFunnelEventSchema = z.enum(pageEntryFunnelEventNames);

export const funnelJourneyCookieName = "iph_journey";
export const funnelJourneyLifetimeSeconds = 60 * 60 * 24 * 30;

export type RecordFunnelEventInput = {
  journeyId: string;
  eventName: FunnelEventName;
  userProfileId?: string | null;
  role?: UserRole | null;
  authIntent?: AuthRedirectIntent | null;
  entityType?: "profile" | "shipment_request" | "quote" | "conversation" | "forwarder_company" | null;
  entityId?: string | null;
  dedupeKey?: string;
};

export function buildFunnelEventDedupeKey(input: RecordFunnelEventInput) {
  return (
    input.dedupeKey ??
    [
      input.journeyId,
      input.eventName,
      input.role ?? "none",
      input.authIntent ?? "none",
      input.entityType ?? "none",
      input.entityId ?? "none",
    ].join(":")
  );
}

export async function getOrCreateFunnelJourneyId() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const existing = z.string().uuid().safeParse(
    cookieStore.get(funnelJourneyCookieName)?.value,
  );

  if (existing.success) {
    return existing.data;
  }

  const journeyId = randomUUID();
  cookieStore.set(funnelJourneyCookieName, journeyId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: funnelJourneyLifetimeSeconds,
    path: "/",
  });
  return journeyId;
}

export async function recordFunnelEvent(
  input: RecordFunnelEventInput,
  database: Pick<Database, "insert"> = db,
) {
  funnelEventNameSchema.parse(input.eventName);
  const [event] = await database
    .insert(funnelEvents)
    .values({
      journeyId: input.journeyId,
      eventName: input.eventName,
      userProfileId: input.userProfileId ?? null,
      role: input.role ?? null,
      authIntent: normalizeAuthRedirectIntent(input.authIntent) ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      dedupeKey: buildFunnelEventDedupeKey(input),
    })
    .onConflictDoNothing({ target: funnelEvents.dedupeKey })
    .returning({ id: funnelEvents.id });

  return { created: Boolean(event), id: event?.id };
}

export async function recordRequestFunnelEvent(
  input: Omit<RecordFunnelEventInput, "journeyId">,
) {
  return recordFunnelEvent({
    ...input,
    journeyId: await getOrCreateFunnelJourneyId(),
  });
}

export async function findJourneyForEntity(input: {
  eventName: FunnelEventName;
  entityType: NonNullable<RecordFunnelEventInput["entityType"]>;
  entityId: string;
}) {
  const [event] = await db
    .select({ journeyId: funnelEvents.journeyId })
    .from(funnelEvents)
    .where(
      and(
        eq(funnelEvents.eventName, input.eventName),
        eq(funnelEvents.entityType, input.entityType),
        eq(funnelEvents.entityId, input.entityId),
      ),
    )
    .orderBy(desc(funnelEvents.createdAt))
    .limit(1);

  return event?.journeyId;
}

const importerFunnel = [
  ["auth_started", "Auth started"],
  ["onboarding_completed", "Onboarding completed"],
  ["request_started", "Request started"],
  ["request_posted", "Request posted"],
  ["quote_received", "Quote received"],
  ["quote_accepted", "Quote accepted"],
] as const;

const forwarderFunnel = [
  ["auth_started", "Auth started"],
  ["onboarding_completed", "Onboarding completed"],
  ["forwarder_profile_ready", "Profile ready"],
  ["quote_started", "Quote started"],
  ["quote_submitted", "Quote submitted"],
  ["first_message_sent", "First message sent"],
] as const;

export async function getAdminFunnelReport(days = 30) {
  await requireAdmin();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      eventName: funnelEvents.eventName,
      role: funnelEvents.role,
      journeys: countDistinct(funnelEvents.journeyId),
    })
    .from(funnelEvents)
    .where(gte(funnelEvents.createdAt, since))
    .groupBy(funnelEvents.eventName, funnelEvents.role);

  const countByRoleAndEvent = new Map(
    rows.map((row) => [`${row.role}:${row.eventName}`, Number(row.journeys)]),
  );

  return {
    days,
    importer: buildFunnelRows("importer", importerFunnel, countByRoleAndEvent),
    forwarder: buildFunnelRows("forwarder", forwarderFunnel, countByRoleAndEvent),
  };
}

function buildFunnelRows(
  role: Extract<UserRole, "importer" | "forwarder">,
  funnel: ReadonlyArray<readonly [FunnelEventName, string]>,
  counts: Map<string, number>,
) {
  const firstCount = counts.get(`${role}:${funnel[0][0]}`) ?? 0;

  return funnel.map(([eventName, label], index) => {
    const journeys = counts.get(`${role}:${eventName}`) ?? 0;
    const previousEvent = funnel[index - 1]?.[0];
    const previousJourneys = previousEvent
      ? counts.get(`${role}:${previousEvent}`) ?? 0
      : journeys;

    return {
      eventName,
      label,
      journeys,
      stepConversion: index === 0 ? 100 : percentage(journeys, previousJourneys),
      totalConversion: index === 0 ? 100 : percentage(journeys, firstCount),
    };
  });
}

function percentage(value: number, base: number) {
  if (base === 0) {
    return 0;
  }

  return Math.round((value / base) * 1000) / 10;
}
