import type { UserRole } from "@/db/schema";
import type { MessageAttachment } from "@/lib/message-attachments";

export type RealtimeMessagePayload = {
  id: string;
  conversationId: string;
  senderUserProfileId: string;
  senderRole: UserRole;
  senderName: string;
  body: string;
  attachments: MessageAttachment[];
  createdAt: string;
};

export type ConversationMessageCreatedEvent = {
  type: "conversation.message.created";
  version: 1;
  eventId: string;
  occurredAt: string;
  conversationId: string;
  message: RealtimeMessagePayload;
};

export type ConversationUpdatedEvent = {
  type: "conversation.updated";
  version: 1;
  eventId: string;
  occurredAt: string;
  conversationId: string;
  updatedAt: string;
  latestMessageId: string;
  latestMessagePreview: string;
};

export type ConversationReadStateUpdatedEvent = {
  type: "conversation.read_state.updated";
  version: 1;
  eventId: string;
  occurredAt: string;
  conversationId: string;
  readerUserProfileId: string;
  lastReadMessageId: string;
  lastReadAt: string;
};

export type ServerRealtimeEvent =
  | ConversationMessageCreatedEvent
  | ConversationUpdatedEvent
  | ConversationReadStateUpdatedEvent;

type RealtimeBridge = {
  publish: (event: ServerRealtimeEvent) => void;
};

declare global {
  var __importingPhRealtime: RealtimeBridge | undefined;
}

export function publishRealtimeEvent(event: ServerRealtimeEvent) {
  globalThis.__importingPhRealtime?.publish(event);
}
