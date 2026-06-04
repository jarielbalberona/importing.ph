import { EmptyState } from "@/components/app-shell";
import {
  formatDate,
  formatDateTime,
  formatMeasure,
  formatMoney,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import {
  getConversationForCurrentImporter,
  getConversationsForCurrentImporter,
} from "@/lib/messages";
import {
  ImporterMessagesClient,
  type ImporterConversationView,
} from "./importer-messages-client";

type ImporterMessagesWorkspaceProps = {
  activeConversationId?: string;
  query?: {
    message?: string;
    messageError?: string;
  };
};

export async function ImporterMessagesWorkspace({
  activeConversationId,
  query,
}: ImporterMessagesWorkspaceProps) {
  const conversations = await getConversationsForCurrentImporter();
  const activeConversation = activeConversationId
    ? await getConversationForCurrentImporter(activeConversationId)
    : undefined;
  const conversationViews = conversations.map((conversation) =>
    toConversationView(conversation, activeConversationId),
  );
  const activeConversationView = activeConversation
    ? toConversationView(activeConversation, activeConversationId)
    : undefined;

  return conversations.length === 0 ? (
    <EmptyState
      title="No conversations yet"
      description="No conversations yet. Conversations start after a forwarder sends a quote."
    />
  ) : (
    <ImporterMessagesClient
      conversations={conversationViews}
      activeConversation={activeConversationView}
      query={query}
    />
  );
}

type ConversationListRow = Awaited<
  ReturnType<typeof getConversationsForCurrentImporter>
>[number];

type ImporterConversation = NonNullable<
  Awaited<ReturnType<typeof getConversationForCurrentImporter>>
>;

type ConversationSource = ConversationListRow | ImporterConversation;

function toConversationView(
  conversation: ConversationSource,
  activeConversationId?: string,
): ImporterConversationView {
  const route = formatStructuredRoute(conversation);
  const requestHref = `/app/requests/${conversation.shipmentRequestId}`;
  const latestMessage =
    "latestMessageBody" in conversation ? conversation.latestMessageBody : null;
  const latestMessageAt =
    "latestMessageAt" in conversation ? conversation.latestMessageAt : null;

  return {
    id: conversation.id,
    href: `/app/requests/messages/${conversation.id}`,
    isActive: conversation.id === activeConversationId,
    forwarderCompanyName: conversation.forwarderCompanyName,
    forwarderContactPerson: conversation.forwarderContactPerson,
    forwarderOriginCities: conversation.forwarderOriginCities,
    forwarderDestinationAreas: conversation.forwarderDestinationAreas,
    forwarderShippingModes: conversation.forwarderShippingModes,
    forwarderServiceDescription: conversation.forwarderServiceDescription,
    cargoDescription: conversation.cargoDescription,
    route,
    preview: latestMessage || "No messages yet",
    updatedAt: formatDate(latestMessageAt ?? conversation.updatedAt),
    shipment: {
      href: requestHref,
      title: conversation.cargoDescription,
      route,
      cargoType: titleFromEnum(conversation.cargoType),
      status: conversation.requestStatus,
      sizeWeight: sizeWeight(conversation),
      deliveryPreference: titleFromEnum(conversation.deliveryPreference),
      shippingPreference: titleFromEnum(conversation.shippingPreference),
      notes: conversation.requestNotes,
    },
    quote: {
      forwarderCompanyName: conversation.forwarderCompanyName,
      amount: formatMoney(conversation.quoteCurrency, conversation.quoteAmount),
      timeline: `${conversation.quoteTransitMinDays}-${conversation.quoteTransitMaxDays} days`,
      service: conversation.quoteServiceOffered,
      status: titleFromEnum(conversation.quoteStatus),
      validUntil: formatDate(conversation.quoteValidUntil),
      inclusions:
        "quoteInclusions" in conversation ? conversation.quoteInclusions : null,
      exclusions:
        "quoteExclusions" in conversation ? conversation.quoteExclusions : null,
      notes: "quoteNotes" in conversation ? conversation.quoteNotes : null,
    },
    messages:
      "messages" in conversation
        ? conversation.messages.map((message) => ({
            id: message.id,
            senderUserProfileId: message.senderUserProfileId,
            senderName: message.senderName,
            senderRole: message.senderRole,
            body: message.body,
            createdAt: formatDateTime(message.createdAt),
          }))
        : [],
    readStates:
      "readStates" in conversation
        ? conversation.readStates.map((readState) => ({
            readerUserProfileId: readState.readerUserProfileId,
            lastReadMessageId: readState.lastReadMessageId,
            lastReadAt: readState.lastReadAt.toISOString(),
          }))
        : [],
    currentUserProfileId:
      "currentUserProfileId" in conversation
        ? conversation.currentUserProfileId
        : null,
  };
}

function sizeWeight(conversation: ConversationSource) {
  const values = [
    conversation.totalCbm ? formatMeasure(conversation.totalCbm, "CBM") : null,
    conversation.totalWeightKg
      ? formatMeasure(conversation.totalWeightKg, "kg")
      : null,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" / ") : null;
}
