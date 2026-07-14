import { clerkClient } from "@clerk/nextjs/server";
import { and, count, desc, eq, isNull, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  conversationReadStates,
  conversations,
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  messages,
  notifications,
  quotes,
  shipmentRequests,
  type NotificationType,
  userProfiles,
} from "@/db/schema";
import { requireProfile } from "@/lib/authz";
import { logServerError } from "@/lib/server-log";
import { sendMarketplaceNotificationEmail } from "@/packages/email/src";

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

type SendEmailInput = {
  to?: string | null;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
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
  } catch (error) {
    logServerError("notification.write_failed", error, {
      recipientUserProfileId: input.recipientUserProfileId,
      sourceShipmentRequestId: input.sourceShipmentRequestId,
      sourceQuoteId: input.sourceQuoteId,
      sourceConversationId: input.sourceConversationId,
      sourceMessageId: input.sourceMessageId,
    });
  }
}

async function sendMarketplaceEmailBestEffort(input: SendEmailInput) {
  if (!input.to || !process.env.RESEND_API_KEY) {
    return;
  }

  try {
    await sendMarketplaceNotificationEmail({
      to: input.to,
      title: input.title,
      body: input.body,
      actionLabel: input.actionLabel,
      actionUrl: input.actionUrl,
    });
  } catch (error) {
    logServerError("notification.email_failed", error);
  }
}

async function getClerkPrimaryEmailBestEffort(clerkUserId?: string | null) {
  if (!clerkUserId || !process.env.RESEND_API_KEY) {
    return null;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);

    return (
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null
    );
  } catch (error) {
    logServerError("notification.clerk_lookup_failed", error);
    return null;
  }
}

export async function notifyShipmentRequestPosted(input: {
  requestId: string;
  actorUserProfileId: string;
}) {
  const [request] = await db
    .select({
      cargoDescription: shipmentRequests.cargoDescription,
      origin: shipmentRequests.origin,
      destination: shipmentRequests.destination,
    })
    .from(shipmentRequests)
    .where(eq(shipmentRequests.id, input.requestId))
    .limit(1);

  if (!request) {
    return;
  }

  const recipients = await db
    .select({
      userProfileId: forwarderMembers.userProfileId,
      contactEmail: forwarderCompanies.contactEmail,
    })
    .from(forwarderMembers)
    .innerJoin(
      forwarderCompanies,
      eq(forwarderMembers.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(eq(forwarderCompanies.isSuspended, false));

  await Promise.all(
    recipients.map(async (recipient) => {
      const title = "New shipment request posted";
      const body = `${request.cargoDescription} from ${request.origin} to ${request.destination}.`;
      const linkHref = `/app/forwarder/requests/${input.requestId}`;

      await createNotificationBestEffort({
        recipientUserProfileId: recipient.userProfileId,
        actorUserProfileId: input.actorUserProfileId,
        type: "new_request_posted",
        title,
        body,
        linkHref,
        sourceShipmentRequestId: input.requestId,
        dedupeKey: `shipment_request:${input.requestId}:posted:${recipient.userProfileId}`,
      });
      await sendMarketplaceEmailBestEffort({
        to: recipient.contactEmail,
        title,
        body,
        actionLabel: "View request",
        actionUrl: linkHref,
      });
    }),
  );
}

export async function notifyQuoteSubmitted(input: {
  quoteId: string;
  requestId: string;
  actorUserProfileId: string;
}) {
  const [target] = await db
    .select({
      importerUserProfileId: importerProfiles.userProfileId,
      importerClerkUserId: userProfiles.clerkUserId,
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
    .innerJoin(userProfiles, eq(importerProfiles.userProfileId, userProfiles.id))
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

  await sendMarketplaceEmailBestEffort({
    to: await getClerkPrimaryEmailBestEffort(target.importerClerkUserId),
    title: "New quote received",
    body: `${target.forwarderCompanyName} sent a quote for ${target.cargoDescription}.`,
    actionLabel: "Review quote",
    actionUrl: `/app/requests/${input.requestId}`,
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
      contactEmail: forwarderCompanies.contactEmail,
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
    .innerJoin(
      forwarderCompanies,
      eq(quotes.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(eq(quotes.id, input.quoteId))
    .limit(1);

  if (!target) {
    return;
  }

  const isAccepted = input.decision === "accepted";

  const title = isAccepted ? "Quote accepted" : "Quote declined";
  const body = `Your quote for ${target.cargoDescription} was ${
    isAccepted ? "accepted" : "declined"
  }.`;
  const linkHref = `/app/forwarder/requests/${input.requestId}`;

  await createNotificationBestEffort({
    recipientUserProfileId: target.forwarderUserProfileId,
    actorUserProfileId: input.actorUserProfileId,
    type: isAccepted ? "quote_accepted" : "quote_rejected",
    title,
    body,
    linkHref,
    sourceShipmentRequestId: input.requestId,
    sourceQuoteId: input.quoteId,
    dedupeKey: `quote:${input.quoteId}:${input.decision}`,
  });
  await sendMarketplaceEmailBestEffort({
    to: target.contactEmail,
    title,
    body,
    actionLabel: "View request",
    actionUrl: linkHref,
  });
}

export async function notifyMessageCreated(input: {
  conversationId: string;
  messageId: string;
  senderUserProfileId: string;
}) {
  const [target] = await db
    .select({
      senderRole: userProfiles.role,
      cargoDescription: shipmentRequests.cargoDescription,
      forwarderCompanyId: forwarderCompanies.id,
      forwarderContactEmail: forwarderCompanies.contactEmail,
    })
    .from(messages)
    .innerJoin(userProfiles, eq(messages.senderUserProfileId, userProfiles.id))
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(
      and(
        eq(messages.id, input.messageId),
        eq(conversations.id, input.conversationId),
        eq(messages.senderUserProfileId, input.senderUserProfileId),
      ),
    )
    .limit(1);

  if (!target || target.senderRole !== "importer") {
    return;
  }

  const shouldEmail = await shouldSendForwarderMessageEmail({
    conversationId: input.conversationId,
    currentMessageId: input.messageId,
    forwarderCompanyId: target.forwarderCompanyId,
  });

  if (!shouldEmail) {
    return;
  }

  await sendMarketplaceEmailBestEffort({
    to: target.forwarderContactEmail,
    title: "New importer message",
    body: `A new message was sent about ${target.cargoDescription}.`,
    actionLabel: "Open conversation",
    actionUrl: `/app/forwarder/messages/${input.conversationId}`,
  });
}

async function shouldSendForwarderMessageEmail(input: {
  conversationId: string;
  currentMessageId: string;
  forwarderCompanyId: string;
}) {
  const [previousMessage] = await db
    .select({
      id: messages.id,
      senderRole: userProfiles.role,
    })
    .from(messages)
    .innerJoin(userProfiles, eq(messages.senderUserProfileId, userProfiles.id))
    .where(
      and(
        eq(messages.conversationId, input.conversationId),
        ne(messages.id, input.currentMessageId),
      ),
    )
    .orderBy(desc(messages.createdAt))
    .limit(1);

  if (!previousMessage || previousMessage.senderRole === "forwarder") {
    return true;
  }

  const [readState] = await db
    .select({ id: conversationReadStates.id })
    .from(conversationReadStates)
    .innerJoin(
      forwarderMembers,
      eq(conversationReadStates.userProfileId, forwarderMembers.userProfileId),
    )
    .where(
      and(
        eq(conversationReadStates.conversationId, input.conversationId),
        eq(conversationReadStates.lastReadMessageId, previousMessage.id),
        eq(forwarderMembers.forwarderCompanyId, input.forwarderCompanyId),
      ),
    )
    .limit(1);

  return Boolean(readState);
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
