"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createMessageInConversationForCurrentForwarder,
  MessagingAccessError,
} from "@/lib/messages";

const idSchema = z.string().uuid();

export async function sendForwarderMessage(formData: FormData) {
  const conversationId = idSchema.safeParse(formData.get("conversationId"));

  if (!conversationId.success) {
    redirect("/app/forwarder/messages?error=invalid-conversation");
  }

  try {
    await createMessageInConversationForCurrentForwarder(
      conversationId.data,
      formData.get("body"),
    );
    redirect(`/app/forwarder/messages/${conversationId.data}?message=sent`);
  } catch (error) {
    if (error instanceof MessagingAccessError || error instanceof z.ZodError) {
      redirect(
        `/app/forwarder/messages/${conversationId.data}?messageError=send`,
      );
    }

    throw error;
  }
}
