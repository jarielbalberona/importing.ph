"use server";

import { z } from "zod";

import {
  createMessageInConversationForCurrentForwarder,
  markConversationReadForCurrentForwarder,
  MessagingAccessError,
  type MessageSendResult,
} from "@/lib/messages";
import { RateLimitError } from "@/lib/rate-limit";
import { logServerError } from "@/lib/server-log";

const idSchema = z.string().uuid();

export async function sendForwarderMessage(
  formData: FormData,
): Promise<MessageSendResult> {
  const conversationId = idSchema.safeParse(formData.get("conversationId"));

  if (!conversationId.success) {
    return { status: "error", code: "invalid_conversation" };
  }

  try {
    const message = await createMessageInConversationForCurrentForwarder(
      conversationId.data,
      formData.get("body"),
    );
    return { status: "sent", message };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { status: "error", code: "rate_limited" };
    }
    if (error instanceof z.ZodError) {
      return { status: "error", code: "validation" };
    }
    if (error instanceof MessagingAccessError) {
      return { status: "error", code: "forbidden" };
    }

    logServerError("message.send_forwarder_failed", error, {
      conversationId: conversationId.data,
    });
    return { status: "error", code: "server_error" };
  }
}

export async function markForwarderConversationRead(input: {
  conversationId: string;
  lastReadMessageId: string;
}) {
  const conversationId = idSchema.parse(input.conversationId);
  const lastReadMessageId = idSchema.parse(input.lastReadMessageId);

  return markConversationReadForCurrentForwarder({
    conversationId,
    lastReadMessageId,
  });
}
