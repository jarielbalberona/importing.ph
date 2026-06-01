import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  conversations,
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
    body: `${target.forwarderCompanyName} submitted a quote for ${target.cargoDescription}.`,
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
    title: isAccepted ? "Quote accepted" : "Quote rejected",
    body: `Your quote for ${target.cargoDescription} was ${input.decision}.`,
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
  const [conversation] = await db
    .select({
      importerUserProfileId: importerProfiles.userProfileId,
      forwarderCompanyId: conversations.forwarderCompanyId,
      shipmentRequestId: conversations.shipmentRequestId,
      cargoDescription: shipmentRequests.cargoDescription,
    })
    .from(conversations)
    .innerJoin(
      importerProfiles,
      eq(conversations.importerProfileId, importerProfiles.id),
    )
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .where(eq(conversations.id, input.conversationId))
    .limit(1);

  if (!conversation) {
    return;
  }

  const recipients =
    input.senderUserProfileId === conversation.importerUserProfileId
      ? await getForwarderMemberRecipientIds(
          conversation.forwarderCompanyId,
          input.senderUserProfileId,
        )
      : [conversation.importerUserProfileId];

  await Promise.all(
    recipients.map((recipientUserProfileId) =>
      createNotificationBestEffort({
        recipientUserProfileId,
        actorUserProfileId: input.senderUserProfileId,
        type: "message_received",
        title: "New message",
        body: `New message about ${conversation.cargoDescription}.`,
        linkHref:
          recipientUserProfileId === conversation.importerUserProfileId
            ? `/app/requests/messages/${input.conversationId}`
            : `/app/forwarder/messages/${input.conversationId}`,
        sourceShipmentRequestId: conversation.shipmentRequestId,
        sourceConversationId: input.conversationId,
        sourceMessageId: input.messageId,
        dedupeKey: `message:${input.messageId}:recipient:${recipientUserProfileId}`,
      }),
    ),
  );
}

async function getForwarderMemberRecipientIds(
  forwarderCompanyId: string,
  senderUserProfileId: string,
) {
  const rows = await db
    .select({ userProfileId: forwarderMembers.userProfileId })
    .from(forwarderMembers)
    .where(
      and(
        eq(forwarderMembers.forwarderCompanyId, forwarderCompanyId),
        ne(forwarderMembers.userProfileId, senderUserProfileId),
      ),
    );

  return rows.map((row) => row.userProfileId);
}

export async function getNotificationsForCurrentUser() {
  const profile = await requireProfile();

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientUserProfileId, profile.id))
    .orderBy(desc(notifications.createdAt));
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
