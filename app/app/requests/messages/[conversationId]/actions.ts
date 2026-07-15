"use server";

import { z } from "zod";

import {
  createMessageInConversationForCurrentImporter,
  markConversationReadForCurrentImporter,
  MessagingAccessError,
  type MessageSendResult,
} from "@/lib/messages";
import { RateLimitError } from "@/lib/rate-limit";
import { logServerError } from "@/lib/server-log";

const idSchema = z.string().uuid();

export async function sendImporterMessage(
  formData: FormData,
): Promise<MessageSendResult> {
  const conversationId = idSchema.safeParse(formData.get("conversationId"));

  if (!conversationId.success) {
    return { status: "error", code: "invalid_conversation" };
  }

  try {
    const attachmentIds = parseAttachmentIds(formData.get("attachmentIds"));
    const message = await createMessageInConversationForCurrentImporter(
      conversationId.data,
      formData.get("body"),
      attachmentIds,
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

    logServerError("message.send_importer_failed", error, {
      conversationId: conversationId.data,
    });
    return { status: "error", code: "server_error" };
  }
}

function parseAttachmentIds(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return [];
  return z.array(z.string().uuid()).max(5).parse(JSON.parse(value));
}

export async function markImporterConversationRead(input: {
  conversationId: string;
  lastReadMessageId: string;
}) {
  const conversationId = idSchema.parse(input.conversationId);
  const lastReadMessageId = idSchema.parse(input.lastReadMessageId);

  return markConversationReadForCurrentImporter({
    conversationId,
    lastReadMessageId,
  });
}
