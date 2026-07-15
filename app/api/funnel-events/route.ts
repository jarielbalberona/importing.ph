import { NextResponse } from "next/server";
import { z } from "zod";

import { getOptionalProfileForCurrentUser } from "@/lib/authz";
import {
  getOrCreateFunnelJourneyId,
  pageEntryFunnelEventSchema,
  recordFunnelEvent,
} from "@/lib/funnel-events";
import { consumeRateLimit, rateLimitPolicies, RateLimitError } from "@/lib/rate-limit";
import { normalizeAuthRedirectIntent } from "@/lib/auth-redirect";

const pageEntrySchema = z.object({
  eventName: pageEntryFunnelEventSchema,
  role: z.enum(["importer", "forwarder"]).optional(),
  authIntent: z.string().optional(),
  entityType: z.enum(["shipment_request"]).optional(),
  entityId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const parsed = pageEntrySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  const journeyId = await getOrCreateFunnelJourneyId();

  try {
    await consumeRateLimit(rateLimitPolicies.funnelEntry, journeyId);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        },
      );
    }
    throw error;
  }

  const { profile } = await getOptionalProfileForCurrentUser();
  await recordFunnelEvent({
    journeyId,
    eventName: parsed.data.eventName,
    userProfileId: profile?.id,
    role: parsed.data.role ?? profile?.role,
    authIntent: normalizeAuthRedirectIntent(parsed.data.authIntent),
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
  });

  return NextResponse.json({ recorded: true });
}
