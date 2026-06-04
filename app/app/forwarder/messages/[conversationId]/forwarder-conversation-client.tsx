"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { DetailCard, EmptyState, StatusBadge } from "@/components/app-shell";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import {
  type ClientRealtimeEvent,
  useConversationRealtime,
} from "@/components/realtime-provider";
import { Textarea } from "@/components/ui/textarea";
import { titleFromEnum } from "@/lib/format";
import { sendForwarderMessage } from "./actions";

type ForwarderMessage = {
  id: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

type ForwarderConversationClientProps = {
  conversationId: string;
  messages: ForwarderMessage[];
  query: {
    message?: string;
    messageError?: string;
  };
};

export function ForwarderConversationClient({
  conversationId,
  messages,
  query,
}: ForwarderConversationClientProps) {
  const router = useRouter();
  const [realtimeMessages, setRealtimeMessages] = useState<ForwarderMessage[]>([]);
  const displayedMessages = useMemo(() => {
    const canonicalMessageIds = new Set(messages.map((message) => message.id));

    return [
      ...messages,
      ...realtimeMessages.filter(
        (message) => !canonicalMessageIds.has(message.id),
      ),
    ];
  }, [messages, realtimeMessages]);
  const handleRealtimeEvent = useCallback(
    (event: ClientRealtimeEvent) => {
      if (
        event.type === "conversation.message.created" &&
        event.conversationId === conversationId
      ) {
        setRealtimeMessages((currentMessages) => {
          const canonicalMessageExists = messages.some(
            (message) => message.id === event.message.id,
          );
          const realtimeMessageExists = currentMessages.some(
            (message) => message.id === event.message.id,
          );

          if (canonicalMessageExists || realtimeMessageExists) {
            return currentMessages;
          }

          return [
            ...currentMessages,
            {
              id: event.message.id,
              senderName: event.message.senderName,
              senderRole: event.message.senderRole,
              body: event.message.body,
              createdAt: new Date(event.message.createdAt).toLocaleString(),
            },
          ];
        });
      }

      if (
        event.type === "conversation.updated" &&
        event.conversationId === conversationId
      ) {
        router.refresh();
      }
    },
    [conversationId, messages, router],
  );
  useConversationRealtime(conversationId, handleRealtimeEvent);

  return (
    <>
      {query.messageError ? (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Message was not sent. Try again.
        </div>
      ) : null}

      <DetailCard
        title="Thread"
        className="mt-6"
      >
        {displayedMessages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Ask or answer a follow-up question about this shipment."
          />
        ) : (
          <div className="grid gap-4">
            {displayedMessages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </DetailCard>

      <form
        action={sendForwarderMessage}
        className="mt-6 grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:p-5"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <Textarea
          name="body"
          required
          rows={4}
          maxLength={2000}
          placeholder="Ask or answer a follow-up question about this shipment."
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Keep the message focused on shipment details, documents, quote scope,
          or delivery questions.
        </p>
        <div className="flex justify-end">
          <PendingSubmitButton
            type="submit"
            pendingText="Sending..."
            className="w-full sm:w-auto"
          >
            Send message
          </PendingSubmitButton>
        </div>
      </form>
    </>
  );
}

function MessageItem({ message }: { message: ForwarderMessage }) {
  return (
    <article className="min-w-0 rounded-md border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-medium">{message.senderName}</p>
          <StatusBadge>{titleFromEnum(message.senderRole)}</StatusBadge>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {message.createdAt}
          <CheckIcon className="size-3" aria-label="Sent" />
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
        {message.body}
      </p>
    </article>
  );
}
