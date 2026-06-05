import { EmptyState } from "@/components/app-shell";
import {
  formatDate,
  formatDateTime,
  formatDeliveryPreference,
  formatMeasure,
  formatMoney,
  formatQuoteShippingMode,
  formatShippingModePreference,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import {
  getConversationForCurrentForwarder,
  getConversationsForCurrentForwarder,
} from "@/lib/messages";
import {
  ImporterMessagesClient,
  type ImporterConversationView,
} from "../../requests/messages/importer-messages-client";
import {
  markForwarderConversationRead,
  sendForwarderMessage,
} from "./[conversationId]/actions";

type ForwarderMessagesWorkspaceProps = {
  activeConversationId?: string;
  query?: {
    message?: string;
    messageError?: string;
  };
};

export async function ForwarderMessagesWorkspace({
  activeConversationId,
  query,
}: ForwarderMessagesWorkspaceProps) {
  const conversations = await getConversationsForCurrentForwarder();
  const activeConversation = activeConversationId
    ? await getConversationForCurrentForwarder(activeConversationId)
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
      description="Messages are available after your company sends a quote for a shipment request."
    />
  ) : (
    <ImporterMessagesClient
      conversations={conversationViews}
      activeConversation={activeConversationView}
      query={query}
      baseHref="/app/forwarder/messages"
      detailsTitle="Importer details"
      detailsSheetDescription="Importer details and shipment context."
      emptyMessageDescription="Ask or answer a follow-up question about this shipment."
      markConversationReadAction={markForwarderConversationRead}
      sendMessageAction={sendForwarderMessage}
    />
  );
}

type ConversationListRow = Awaited<
  ReturnType<typeof getConversationsForCurrentForwarder>
>[number];

type ForwarderConversation = NonNullable<
  Awaited<ReturnType<typeof getConversationForCurrentForwarder>>
>;

type ConversationSource = ConversationListRow | ForwarderConversation;

function toConversationView(
  conversation: ConversationSource,
  activeConversationId?: string,
): ImporterConversationView {
  const route = formatStructuredRoute(conversation);
  const requestHref = `/app/forwarder/requests/${conversation.shipmentRequestId}`;
  const latestMessage =
    "latestMessageBody" in conversation ? conversation.latestMessageBody : null;
  const latestMessageAt =
    "latestMessageAt" in conversation ? conversation.latestMessageAt : null;

  return {
    id: conversation.id,
    href: `/app/forwarder/messages/${conversation.id}`,
    isActive: conversation.id === activeConversationId,
    counterpartyName: conversation.importerCompanyName,
    counterpartyDetails: [
      { label: "Company", value: conversation.importerCompanyName },
      { label: "Contact phone", value: conversation.importerContactPhone },
      { label: "Location", value: conversation.importerLocation },
    ],
    forwarderCompanyName: conversation.forwarderCompanyName,
    forwarderContactPerson: conversation.forwarderContactPerson,
    forwarderOriginCities: conversation.forwarderOriginCities,
    forwarderDestinationAreas: conversation.forwarderDestinationAreas,
    forwarderShippingModes: conversation.forwarderShippingModes,
    forwarderServiceDescription: conversation.forwarderServiceDescription,
    cargoDescription: conversation.cargoDescription,
    route,
    preview: latestMessage || "No messages yet",
    hasUnread: "hasUnread" in conversation ? conversation.hasUnread : false,
    updatedAt: formatDate(latestMessageAt ?? conversation.updatedAt),
    shipment: {
      href: requestHref,
      title: conversation.cargoDescription,
      route,
      cargoType: titleFromEnum(conversation.cargoType),
      status: conversation.requestStatus,
      sizeWeight: sizeWeight(conversation),
      deliveryPreference: formatDeliveryPreference(conversation.deliveryPreference),
      shippingModePreference: formatShippingModePreference(
        conversation.shippingModePreference,
      ),
      shippingPreference: titleFromEnum(conversation.shippingPreference),
      notes: conversation.requestNotes,
    },
    quote: {
      forwarderCompanyName: conversation.forwarderCompanyName,
      amount: formatMoney(conversation.quoteCurrency, conversation.quoteAmount),
      shippingMode: formatQuoteShippingMode(conversation.quoteShippingMode),
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
