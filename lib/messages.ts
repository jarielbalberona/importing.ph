import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  conversationReadStates,
  conversations,
  forwarderCompanies,
  importerProfiles,
  messages,
  quotes,
  shipmentRequests,
  userProfiles,
} from "@/db/schema";
import {
  attachFilesToMessage,
  listAttachmentsForMessages,
  messageAttachmentPreview,
  type MessageAttachment,
} from "@/lib/message-attachments";
import { requireForwarderMember } from "@/lib/forwarder-open-requests";
import { notifyMessageCreated } from "@/lib/notifications";
import { publishRealtimeEvent } from "@/lib/realtime-events";
import { runBestEffort } from "@/lib/best-effort";
import { consumeRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { requireImporterProfile } from "@/lib/shipment-requests";
import { recordRequestFunnelEvent } from "@/lib/funnel-events";

const messagingQuoteStatuses = ["submitted", "accepted", "rejected"] as const;

export class MessagingAccessError extends Error {
  constructor(readonly code: "not_found" | "no_quote" | "forbidden") {
    super(code);
  }
}

export const messageBodySchema = z.string().trim().max(2000);

export const messageInputSchema = z
  .object({
    body: messageBodySchema,
    attachmentIds: z.array(z.string().uuid()).max(5),
  })
  .refine(
    (input) => input.body.length > 0 || input.attachmentIds.length > 0,
    "Write a message or attach at least one file.",
  );

export type MessageBodyInput = z.infer<typeof messageBodySchema>;

export type SentMessage = {
  id: string;
  conversationId: string;
  senderUserProfileId: string;
  senderRole: string;
  senderName: string;
  body: string;
  attachments: MessageAttachment[];
  createdAt: string;
};

export type MessageSendResult =
  | { status: "sent"; message: SentMessage }
  | {
      status: "error";
      code:
        | "invalid_conversation"
        | "validation"
        | "rate_limited"
        | "forbidden"
        | "server_error";
    };

export type ConversationParticipant = "importer" | "forwarder";

const conversationColumns = {
  id: conversations.id,
  shipmentRequestId: conversations.shipmentRequestId,
  importerProfileId: conversations.importerProfileId,
  forwarderCompanyId: conversations.forwarderCompanyId,
  openedByQuoteId: conversations.openedByQuoteId,
  createdAt: conversations.createdAt,
  updatedAt: conversations.updatedAt,
  cargoDescription: shipmentRequests.cargoDescription,
  cargoType: shipmentRequests.cargoType,
  totalCbm: shipmentRequests.totalCbm,
  totalWeightKg: shipmentRequests.totalWeightKg,
  requestStatus: shipmentRequests.status,
  origin: shipmentRequests.origin,
  destination: shipmentRequests.destination,
  destinationRegionName: shipmentRequests.destinationRegionName,
  destinationProvinceName: shipmentRequests.destinationProvinceName,
  destinationCityMunicipalityName: shipmentRequests.destinationCityMunicipalityName,
  destinationBarangayName: shipmentRequests.destinationBarangayName,
  destinationDisplayName: shipmentRequests.destinationDisplayName,
  deliveryPreference: shipmentRequests.deliveryPreference,
  shippingModePreference: shipmentRequests.shippingModePreference,
  shippingPreference: shipmentRequests.shippingPreference,
  requestNotes: shipmentRequests.notes,
  importerCompanyName: importerProfiles.companyName,
  importerContactPhone: importerProfiles.contactPhone,
  importerLocation: importerProfiles.location,
  forwarderCompanyName: forwarderCompanies.name,
  forwarderContactPerson: forwarderCompanies.contactPerson,
  forwarderOriginCities: forwarderCompanies.originCities,
  forwarderDestinationAreas: forwarderCompanies.destinationAreas,
  forwarderShippingModes: forwarderCompanies.shippingModes,
  forwarderServiceDescription: forwarderCompanies.serviceDescription,
  quoteStatus: quotes.status,
  quoteAmount: quotes.quoteAmount,
  quoteCurrency: quotes.currency,
  quoteShippingMode: quotes.shippingMode,
  quoteServiceOffered: quotes.serviceOffered,
  quoteTransitMinDays: quotes.estimatedTransitMinDays,
  quoteTransitMaxDays: quotes.estimatedTransitMaxDays,
  quoteInclusions: quotes.inclusions,
  quoteExclusions: quotes.exclusions,
  quoteNotes: quotes.notes,
  quoteValidUntil: quotes.validUntil,
};

const messageColumns = {
  id: messages.id,
  conversationId: messages.conversationId,
  senderUserProfileId: messages.senderUserProfileId,
  senderRole: userProfiles.role,
  senderName: userProfiles.fullName,
  body: messages.body,
  createdAt: messages.createdAt,
};

const readStateColumns = {
  readerUserProfileId: conversationReadStates.userProfileId,
  lastReadMessageId: conversationReadStates.lastReadMessageId,
  lastReadAt: conversationReadStates.lastReadAt,
};

async function getQuoteGateForImporter(
  requestId: string,
  importerProfileId: string,
  forwarderCompanyId: string,
) {
  const [quoteGate] = await db
    .select({
      quoteId: quotes.id,
      importerProfileId: shipmentRequests.importerProfileId,
    })
    .from(quotes)
    .innerJoin(
      shipmentRequests,
      eq(quotes.shipmentRequestId, shipmentRequests.id),
    )
    .where(
      and(
        eq(quotes.shipmentRequestId, requestId),
        eq(shipmentRequests.importerProfileId, importerProfileId),
        eq(quotes.forwarderCompanyId, forwarderCompanyId),
        inArray(quotes.status, messagingQuoteStatuses),
      ),
    )
    .limit(1);

  return quoteGate;
}

async function getQuoteGateForForwarder(
  requestId: string,
  forwarderCompanyId: string,
) {
  const [quoteGate] = await db
    .select({
      quoteId: quotes.id,
      importerProfileId: shipmentRequests.importerProfileId,
    })
    .from(quotes)
    .innerJoin(
      shipmentRequests,
      eq(quotes.shipmentRequestId, shipmentRequests.id),
    )
    .where(
      and(
        eq(quotes.shipmentRequestId, requestId),
        eq(quotes.forwarderCompanyId, forwarderCompanyId),
        inArray(quotes.status, messagingQuoteStatuses),
      ),
    )
    .limit(1);

  return quoteGate;
}

async function getOrCreateConversation(input: {
  requestId: string;
  importerProfileId: string;
  forwarderCompanyId: string;
  quoteId: string;
}) {
  const [inserted] = await db
    .insert(conversations)
    .values({
      shipmentRequestId: input.requestId,
      importerProfileId: input.importerProfileId,
      forwarderCompanyId: input.forwarderCompanyId,
      openedByQuoteId: input.quoteId,
    })
    .onConflictDoNothing({
      target: [
        conversations.shipmentRequestId,
        conversations.forwarderCompanyId,
      ],
    })
    .returning({ id: conversations.id });

  if (inserted) {
    return inserted.id;
  }

  const [conversation] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.shipmentRequestId, input.requestId),
        eq(conversations.forwarderCompanyId, input.forwarderCompanyId),
      ),
    )
    .limit(1);

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  return conversation.id;
}

export async function getOrCreateConversationForCurrentImporter(
  requestId: string,
  forwarderCompanyId: string,
) {
  const { importerProfile } = await requireImporterProfile();
  const quoteGate = await getQuoteGateForImporter(
    requestId,
    importerProfile.id,
    forwarderCompanyId,
  );

  if (!quoteGate) {
    throw new MessagingAccessError("no_quote");
  }

  return getOrCreateConversation({
    requestId,
    importerProfileId: importerProfile.id,
    forwarderCompanyId,
    quoteId: quoteGate.quoteId,
  });
}

export async function getOrCreateConversationForCurrentForwarder(
  requestId: string,
) {
  const { member } = await requireForwarderMember();
  const quoteGate = await getQuoteGateForForwarder(requestId, member.companyId);

  if (!quoteGate) {
    throw new MessagingAccessError("no_quote");
  }

  return getOrCreateConversation({
    requestId,
    importerProfileId: quoteGate.importerProfileId,
    forwarderCompanyId: member.companyId,
    quoteId: quoteGate.quoteId,
  });
}

export async function getConversationForCurrentImporter(conversationId: string) {
  const { profile, importerProfile } = await requireImporterProfile();

  const conversation = await getConversationForParticipant({
    conversationId,
    participant: "importer",
    participantId: importerProfile.id,
  });

  return conversation
    ? {
        ...conversation,
        currentUserProfileId: profile.id,
      }
    : undefined;
}

export async function getConversationForCurrentForwarder(conversationId: string) {
  const { profile, member } = await requireForwarderMember();

  const conversation = await getConversationForParticipant({
    conversationId,
    participant: "forwarder",
    participantId: member.companyId,
  });

  return conversation
    ? {
        ...conversation,
        currentUserProfileId: profile.id,
      }
    : undefined;
}

async function getConversationForParticipant(input: {
  conversationId: string;
  participant: ConversationParticipant;
  participantId: string;
}) {
  const conditions = [
    eq(conversations.id, input.conversationId),
    input.participant === "importer"
      ? eq(conversations.importerProfileId, input.participantId)
      : eq(conversations.forwarderCompanyId, input.participantId),
  ];

  const [conversation] = await db
    .select(conversationColumns)
    .from(conversations)
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      importerProfiles,
      eq(conversations.importerProfileId, importerProfiles.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
    .innerJoin(quotes, eq(conversations.openedByQuoteId, quotes.id))
    .where(and(...conditions))
    .limit(1);

  if (!conversation) {
    return undefined;
  }

  const conversationMessages = await db
    .select(messageColumns)
    .from(messages)
    .innerJoin(userProfiles, eq(messages.senderUserProfileId, userProfiles.id))
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(messages.createdAt);
  const attachmentsByMessageId = await listAttachmentsForMessages(
    conversationMessages.map((message) => message.id),
  );

  const readStates = await db
    .select(readStateColumns)
    .from(conversationReadStates)
    .where(eq(conversationReadStates.conversationId, conversation.id));

  return {
    ...conversation,
    messages: conversationMessages.map((message) => ({
      ...message,
      attachments: attachmentsByMessageId.get(message.id) ?? [],
    })),
    readStates,
  };
}

export async function getConversationsForCurrentImporter() {
  const { profile, importerProfile } = await requireImporterProfile();

  const importerConversations = await db
    .select(conversationColumns)
    .from(conversations)
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      importerProfiles,
      eq(conversations.importerProfileId, importerProfiles.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
    .innerJoin(quotes, eq(conversations.openedByQuoteId, quotes.id))
    .where(eq(conversations.importerProfileId, importerProfile.id))
    .orderBy(desc(conversations.updatedAt));

  return attachLatestMessages(importerConversations, profile.id);
}

export async function getConversationsForCurrentForwarder() {
  const { profile, member } = await requireForwarderMember();

  const forwarderConversations = await db
    .select(conversationColumns)
    .from(conversations)
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      importerProfiles,
      eq(conversations.importerProfileId, importerProfiles.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
    .innerJoin(quotes, eq(conversations.openedByQuoteId, quotes.id))
    .where(eq(conversations.forwarderCompanyId, member.companyId))
    .orderBy(desc(conversations.updatedAt));

  return attachLatestMessages(forwarderConversations, profile.id);
}

async function attachLatestMessages<T extends { id: string }>(
  conversationRows: T[],
  currentUserProfileId: string,
) {
  if (conversationRows.length === 0) {
    return conversationRows.map((conversation) => ({
      ...conversation,
      latestMessageBody: null,
      latestMessageAt: null,
      hasUnread: false,
    }));
  }

  const conversationIds = conversationRows.map((conversation) => conversation.id);
  const latestRows = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderUserProfileId: messages.senderUserProfileId,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(inArray(messages.conversationId, conversationIds))
    .orderBy(desc(messages.createdAt));
  const latestAttachments = await listAttachmentsForMessages(
    latestRows.map((message) => message.id),
  );

  const latestByConversationId = new Map<
    string,
    {
      id: string;
      senderUserProfileId: string;
      body: string;
      createdAt: Date;
    }
  >();

  for (const message of latestRows) {
    if (!latestByConversationId.has(message.conversationId)) {
      latestByConversationId.set(message.conversationId, {
        id: message.id,
        senderUserProfileId: message.senderUserProfileId,
        body: message.body,
        createdAt: message.createdAt,
      });
    }
  }

  const readStateRows = await db
    .select({
      conversationId: conversationReadStates.conversationId,
      lastReadMessageId: conversationReadStates.lastReadMessageId,
    })
    .from(conversationReadStates)
    .where(
      and(
        inArray(conversationReadStates.conversationId, conversationIds),
        eq(conversationReadStates.userProfileId, currentUserProfileId),
      ),
    );

  const lastReadMessageIdByConversationId = new Map(
    readStateRows.map((readState) => [
      readState.conversationId,
      readState.lastReadMessageId,
    ]),
  );

  return conversationRows.map((conversation) => {
    const latestMessage = latestByConversationId.get(conversation.id);
    const hasUnread = Boolean(
      latestMessage &&
        latestMessage.senderUserProfileId !== currentUserProfileId &&
        lastReadMessageIdByConversationId.get(conversation.id) !==
          latestMessage.id,
    );

    return {
      ...conversation,
      latestMessageBody: latestMessage
        ? latestMessage.body ||
          messageAttachmentPreview(latestAttachments.get(latestMessage.id) ?? [])
        : null,
      latestMessageAt: latestMessage?.createdAt ?? null,
      hasUnread,
    };
  });
}

export async function createMessageForCurrentImporter(
  requestId: string,
  forwarderCompanyId: string,
  bodyInput: unknown,
  attachmentIdsInput: unknown = [],
) {
  const { profile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.messageSend, profile.id);
  const conversationId = await getOrCreateConversationForCurrentImporter(
    requestId,
    forwarderCompanyId,
  );

  const message = await createMessageInConversation({
    conversationId,
    senderUserProfileId: profile.id,
    bodyInput,
    attachmentIdsInput,
  });
  await recordFirstMessageFunnelEvent({
    conversationId,
    userProfileId: profile.id,
    role: profile.role,
  });
  return message;
}

export async function createMessageForCurrentForwarder(
  requestId: string,
  bodyInput: unknown,
  attachmentIdsInput: unknown = [],
) {
  const { profile } = await requireForwarderMember();
  await consumeRateLimit(rateLimitPolicies.messageSend, profile.id);
  const conversationId = await getOrCreateConversationForCurrentForwarder(
    requestId,
  );

  const message = await createMessageInConversation({
    conversationId,
    senderUserProfileId: profile.id,
    bodyInput,
    attachmentIdsInput,
  });
  await recordFirstMessageFunnelEvent({
    conversationId,
    userProfileId: profile.id,
    role: profile.role,
  });
  return message;
}

export async function createMessageInConversationForCurrentImporter(
  conversationId: string,
  bodyInput: unknown,
  attachmentIdsInput: unknown = [],
) {
  const conversation = await getConversationForCurrentImporter(conversationId);
  const { profile } = await requireImporterProfile();

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  await consumeRateLimit(rateLimitPolicies.messageSend, profile.id);

  const message = await createMessageInConversation({
    conversationId: conversation.id,
    senderUserProfileId: profile.id,
    bodyInput,
    attachmentIdsInput,
  });
  await recordFirstMessageFunnelEvent({
    conversationId: conversation.id,
    userProfileId: profile.id,
    role: profile.role,
  });
  return message;
}

export async function createMessageInConversationForCurrentForwarder(
  conversationId: string,
  bodyInput: unknown,
  attachmentIdsInput: unknown = [],
) {
  const conversation = await getConversationForCurrentForwarder(conversationId);
  const { profile } = await requireForwarderMember();

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  await consumeRateLimit(rateLimitPolicies.messageSend, profile.id);

  const message = await createMessageInConversation({
    conversationId: conversation.id,
    senderUserProfileId: profile.id,
    bodyInput,
    attachmentIdsInput,
  });
  await recordFirstMessageFunnelEvent({
    conversationId: conversation.id,
    userProfileId: profile.id,
    role: profile.role,
  });
  return message;
}

async function recordFirstMessageFunnelEvent(input: {
  conversationId: string;
  userProfileId: string;
  role: "importer" | "forwarder" | "admin";
}) {
  await runBestEffort(
    "funnel.first_message_failed",
    () =>
      recordRequestFunnelEvent({
        eventName: "first_message_sent",
        userProfileId: input.userProfileId,
        role: input.role,
        entityType: "conversation",
        entityId: input.conversationId,
      }),
    { conversationId: input.conversationId },
  );
}

export async function markConversationReadForCurrentImporter(input: {
  conversationId: string;
  lastReadMessageId: string;
}) {
  const conversation = await getConversationForCurrentImporter(input.conversationId);

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  return markConversationRead({
    conversationId: conversation.id,
    userProfileId: conversation.currentUserProfileId,
    lastReadMessageId: input.lastReadMessageId,
  });
}

export async function markConversationReadForCurrentForwarder(input: {
  conversationId: string;
  lastReadMessageId: string;
}) {
  const conversation = await getConversationForCurrentForwarder(input.conversationId);

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  return markConversationRead({
    conversationId: conversation.id,
    userProfileId: conversation.currentUserProfileId,
    lastReadMessageId: input.lastReadMessageId,
  });
}

async function markConversationRead(input: {
  conversationId: string;
  userProfileId: string;
  lastReadMessageId: string;
}) {
  const result = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`${input.conversationId}:${input.userProfileId}`}))`,
    );

    const [targetMessage] = await tx
      .select({
        id: messages.id,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          eq(messages.id, input.lastReadMessageId),
          eq(messages.conversationId, input.conversationId),
        ),
      )
      .limit(1);

    if (!targetMessage) {
      throw new MessagingAccessError("not_found");
    }

    const [existing] = await tx
      .select({
        lastReadMessageId: conversationReadStates.lastReadMessageId,
        lastReadAt: conversationReadStates.lastReadAt,
        lastReadMessageCreatedAt: messages.createdAt,
      })
      .from(conversationReadStates)
      .innerJoin(
        messages,
        eq(conversationReadStates.lastReadMessageId, messages.id),
      )
      .where(
        and(
          eq(conversationReadStates.conversationId, input.conversationId),
          eq(conversationReadStates.userProfileId, input.userProfileId),
        ),
      )
      .limit(1);

    if (existing && existing.lastReadMessageCreatedAt >= targetMessage.createdAt) {
      return {
        advanced: false,
        readState: {
          readerUserProfileId: input.userProfileId,
          lastReadMessageId: existing.lastReadMessageId,
          lastReadAt: existing.lastReadAt,
        },
      };
    }

    const now = new Date();
    const [readState] = await tx
      .insert(conversationReadStates)
      .values({
        conversationId: input.conversationId,
        userProfileId: input.userProfileId,
        lastReadMessageId: targetMessage.id,
        lastReadAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          conversationReadStates.conversationId,
          conversationReadStates.userProfileId,
        ],
        set: {
          lastReadMessageId: targetMessage.id,
          lastReadAt: now,
          updatedAt: now,
        },
      })
      .returning(readStateColumns);

    return {
      advanced: true,
      readState,
    };
  });

  if (result.advanced) {
    publishRealtimeEvent({
      type: "conversation.read_state.updated",
      version: 1,
      eventId: `conversation:${input.conversationId}:read:${result.readState.readerUserProfileId}:${result.readState.lastReadMessageId}`,
      occurredAt: new Date().toISOString(),
      conversationId: input.conversationId,
      readerUserProfileId: result.readState.readerUserProfileId,
      lastReadMessageId: result.readState.lastReadMessageId,
      lastReadAt: result.readState.lastReadAt.toISOString(),
    });
  }

  return {
    readerUserProfileId: result.readState.readerUserProfileId,
    lastReadMessageId: result.readState.lastReadMessageId,
    lastReadAt: result.readState.lastReadAt.toISOString(),
  };
}

async function createMessageInConversation(input: {
  conversationId: string;
  senderUserProfileId: string;
  bodyInput: unknown;
  attachmentIdsInput: unknown;
}) {
  const parsed = messageInputSchema.parse({
    body: input.bodyInput ?? "",
    attachmentIds: input.attachmentIdsInput ?? [],
  });
  const body = parsed.body;
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        senderUserProfileId: input.senderUserProfileId,
        body,
        updatedAt: now,
      })
      .returning({
        id: messages.id,
        createdAt: messages.createdAt,
      });

    const attachments = await attachFilesToMessage(tx, {
      messageId: inserted.id,
      conversationId: input.conversationId,
      ownerUserProfileId: input.senderUserProfileId,
      fileIds: parsed.attachmentIds,
    });

    await tx
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, input.conversationId));

    const [message] = await tx
      .select(messageColumns)
      .from(messages)
      .innerJoin(userProfiles, eq(messages.senderUserProfileId, userProfiles.id))
      .where(eq(messages.id, inserted.id))
      .limit(1);

    if (!message) {
      throw new Error("Message was not available after insert.");
    }

    return {
      message,
      attachments,
      inserted,
      conversationUpdatedAt: now,
    };
  });

  await runBestEffort(
    "notification.message_created_failed",
    () =>
      notifyMessageCreated({
        conversationId: input.conversationId,
        messageId: result.inserted.id,
        senderUserProfileId: input.senderUserProfileId,
      }),
    {
      conversationId: input.conversationId,
      messageId: result.inserted.id,
    },
  );

  publishRealtimeEvent({
    type: "conversation.message.created",
    version: 1,
    eventId: `message:${result.message.id}:created`,
    occurredAt: new Date().toISOString(),
    conversationId: input.conversationId,
    message: {
      id: result.message.id,
      conversationId: result.message.conversationId,
      senderUserProfileId: result.message.senderUserProfileId,
      senderRole: result.message.senderRole,
      senderName: result.message.senderName,
      body: result.message.body,
      attachments: result.attachments,
      createdAt: result.message.createdAt.toISOString(),
    },
  });
  publishRealtimeEvent({
    type: "conversation.updated",
    version: 1,
    eventId: `conversation:${input.conversationId}:updated:${result.conversationUpdatedAt.toISOString()}`,
    occurredAt: new Date().toISOString(),
    conversationId: input.conversationId,
    updatedAt: result.conversationUpdatedAt.toISOString(),
    latestMessageId: result.message.id,
    latestMessagePreview:
      result.message.body || messageAttachmentPreview(result.attachments),
  });

  return {
    id: result.message.id,
    conversationId: result.message.conversationId,
    senderUserProfileId: result.message.senderUserProfileId,
    senderRole: result.message.senderRole,
    senderName: result.message.senderName,
    body: result.message.body,
    attachments: result.attachments,
    createdAt: result.message.createdAt.toISOString(),
  } satisfies SentMessage;
}
