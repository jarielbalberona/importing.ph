import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  conversations,
  forwarderCompanies,
  messages,
  quotes,
  shipmentRequests,
  userProfiles,
} from "@/db/schema";
import { requireForwarderMember } from "@/lib/forwarder-open-requests";
import { requireImporterProfile } from "@/lib/shipment-requests";

const messagingQuoteStatuses = ["submitted", "accepted", "rejected"] as const;

export class MessagingAccessError extends Error {
  constructor(readonly code: "not_found" | "no_quote" | "forbidden") {
    super(code);
  }
}

export const messageBodySchema = z.string().trim().min(1).max(2000);

export type MessageBodyInput = z.infer<typeof messageBodySchema>;

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
  origin: shipmentRequests.origin,
  destination: shipmentRequests.destination,
  forwarderCompanyName: forwarderCompanies.name,
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
  const { importerProfile } = await requireImporterProfile();

  return getConversationForParticipant({
    conversationId,
    participant: "importer",
    participantId: importerProfile.id,
  });
}

export async function getConversationForCurrentForwarder(conversationId: string) {
  const { member } = await requireForwarderMember();

  return getConversationForParticipant({
    conversationId,
    participant: "forwarder",
    participantId: member.companyId,
  });
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
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
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

  return {
    ...conversation,
    messages: conversationMessages,
  };
}

export async function getConversationsForCurrentImporter() {
  const { importerProfile } = await requireImporterProfile();

  return db
    .select(conversationColumns)
    .from(conversations)
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(eq(conversations.importerProfileId, importerProfile.id))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationsForCurrentForwarder() {
  const { member } = await requireForwarderMember();

  return db
    .select(conversationColumns)
    .from(conversations)
    .innerJoin(
      shipmentRequests,
      eq(conversations.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(conversations.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(eq(conversations.forwarderCompanyId, member.companyId))
    .orderBy(desc(conversations.updatedAt));
}

export async function createMessageForCurrentImporter(
  requestId: string,
  forwarderCompanyId: string,
  bodyInput: unknown,
) {
  const { profile } = await requireImporterProfile();
  const conversationId = await getOrCreateConversationForCurrentImporter(
    requestId,
    forwarderCompanyId,
  );

  return createMessageInConversation({
    conversationId,
    senderUserProfileId: profile.id,
    bodyInput,
  });
}

export async function createMessageForCurrentForwarder(
  requestId: string,
  bodyInput: unknown,
) {
  const { profile } = await requireForwarderMember();
  const conversationId = await getOrCreateConversationForCurrentForwarder(
    requestId,
  );

  return createMessageInConversation({
    conversationId,
    senderUserProfileId: profile.id,
    bodyInput,
  });
}

export async function createMessageInConversationForCurrentImporter(
  conversationId: string,
  bodyInput: unknown,
) {
  const conversation = await getConversationForCurrentImporter(conversationId);
  const { profile } = await requireImporterProfile();

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  return createMessageInConversation({
    conversationId: conversation.id,
    senderUserProfileId: profile.id,
    bodyInput,
  });
}

export async function createMessageInConversationForCurrentForwarder(
  conversationId: string,
  bodyInput: unknown,
) {
  const conversation = await getConversationForCurrentForwarder(conversationId);
  const { profile } = await requireForwarderMember();

  if (!conversation) {
    throw new MessagingAccessError("not_found");
  }

  return createMessageInConversation({
    conversationId: conversation.id,
    senderUserProfileId: profile.id,
    bodyInput,
  });
}

async function createMessageInConversation(input: {
  conversationId: string;
  senderUserProfileId: string;
  bodyInput: unknown;
}) {
  const body = messageBodySchema.parse(input.bodyInput);
  const now = new Date();

  const [message] = await db
    .insert(messages)
    .values({
      conversationId: input.conversationId,
      senderUserProfileId: input.senderUserProfileId,
      body,
      updatedAt: now,
    })
    .returning({ id: messages.id });

  await db
    .update(conversations)
    .set({ updatedAt: now })
    .where(eq(conversations.id, input.conversationId));

  return message;
}
