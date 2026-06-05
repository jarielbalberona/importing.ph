import { and, count, desc, eq, isNull, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  notifications,
  quotes,
  shipmentRequests,
  type NotificationType,
} from "@/db/schema";
import { requireProfile } from "@/lib/authz";

type CreateNotificationInput = {
  recipientUserProfileId: string;
  actorUserProfileId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkHref: string;
  sourceShipmentRequestId?: string;
  sourceQuoteId?: string;
  sourceConversationId?: string;
  sourceMessageId?: string;
  dedupeKey: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const [notification] = await db
    .insert(notifications)
    .values({
      recipientUserProfileId: input.recipientUserProfileId,
      actorUserProfileId: input.actorUserProfileId,
      type: input.type,
      title: input.title,
      body: input.body,
      linkHref: input.linkHref,
      sourceShipmentRequestId: input.sourceShipmentRequestId,
      sourceQuoteId: input.sourceQuoteId,
      sourceConversationId: input.sourceConversationId,
      sourceMessageId: input.sourceMessageId,
      dedupeKey: input.dedupeKey,
    })
    .onConflictDoNothing({ target: notifications.dedupeKey })
    .returning({ id: notifications.id });

  return notification;
}

async function createNotificationBestEffort(input: CreateNotificationInput) {
  try {
    await createNotification(input);
  } catch {
    // Notification writes are not business-critical for V1 marketplace actions.
  }
}

export async function notifyQuoteSubmitted(input: {
  quoteId: string;
  requestId: string;
  actorUserProfileId: string;
}) {
  const [target] = await db
    .select({
      importerUserProfileId: importerProfiles.userProfileId,
      cargoDescription: shipmentRequests.cargoDescription,
      forwarderCompanyName: forwarderCompanies.name,
    })
    .from(quotes)
    .innerJoin(
      shipmentRequests,
      eq(quotes.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      importerProfiles,
      eq(shipmentRequests.importerProfileId, importerProfiles.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(quotes.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(eq(quotes.id, input.quoteId))
    .limit(1);

  if (!target) {
    return;
  }

  await createNotificationBestEffort({
    recipientUserProfileId: target.importerUserProfileId,
    actorUserProfileId: input.actorUserProfileId,
    type: "new_quote_received",
    title: "New quote received",
    body: `${target.forwarderCompanyName} sent a quote for ${target.cargoDescription}.`,
    linkHref: `/app/requests/${input.requestId}`,
    sourceShipmentRequestId: input.requestId,
    sourceQuoteId: input.quoteId,
    dedupeKey: `quote:${input.quoteId}:created`,
  });
}

export async function notifyQuoteDecision(input: {
  quoteId: string;
  requestId: string;
  actorUserProfileId: string;
  decision: "accepted" | "rejected";
}) {
  const [target] = await db
    .select({
      forwarderUserProfileId: forwarderMembers.userProfileId,
      cargoDescription: shipmentRequests.cargoDescription,
    })
    .from(quotes)
    .innerJoin(
      shipmentRequests,
      eq(quotes.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      forwarderMembers,
      eq(quotes.submittedByForwarderMemberId, forwarderMembers.id),
    )
    .where(eq(quotes.id, input.quoteId))
    .limit(1);

  if (!target) {
    return;
  }

  const isAccepted = input.decision === "accepted";

  await createNotificationBestEffort({
    recipientUserProfileId: target.forwarderUserProfileId,
    actorUserProfileId: input.actorUserProfileId,
    type: isAccepted ? "quote_accepted" : "quote_rejected",
    title: isAccepted ? "Quote accepted" : "Quote declined",
    body: `Your quote for ${target.cargoDescription} was ${
      isAccepted ? "accepted" : "declined"
    }.`,
    linkHref: `/app/forwarder/requests/${input.requestId}`,
    sourceShipmentRequestId: input.requestId,
    sourceQuoteId: input.quoteId,
    dedupeKey: `quote:${input.quoteId}:${input.decision}`,
  });
}

export async function notifyMessageCreated(input: {
  conversationId: string;
  messageId: string;
  senderUserProfileId: string;
}) {
  void input;
}

export async function getNotificationsForCurrentUser() {
  const profile = await requireProfile();

  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientUserProfileId, profile.id),
        ne(notifications.type, "message_received"),
      ),
    )
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationCountForCurrentUser() {
  const profile = await requireProfile();

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientUserProfileId, profile.id),
        ne(notifications.type, "message_received"),
        isNull(notifications.readAt),
      ),
    );

  return result?.count ?? 0;
}

export async function markNotificationReadForCurrentUser(notificationId: string) {
  const profile = await requireProfile();

  const [notification] = await db
    .update(notifications)
    .set({
      readAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientUserProfileId, profile.id),
      ),
    )
    .returning({ id: notifications.id });

  return notification;
}
