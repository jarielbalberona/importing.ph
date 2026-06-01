"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createMessageInConversationForCurrentImporter,
  MessagingAccessError,
} from "@/lib/messages";

const idSchema = z.string().uuid();

export async function sendImporterMessage(formData: FormData) {
  const conversationId = idSchema.safeParse(formData.get("conversationId"));

  if (!conversationId.success) {
    redirect("/app/requests/messages?error=invalid-conversation");
  }

  try {
    await createMessageInConversationForCurrentImporter(
      conversationId.data,
      formData.get("body"),
    );
    redirect(`/app/requests/messages/${conversationId.data}?message=sent`);
  } catch (error) {
    if (error instanceof MessagingAccessError || error instanceof z.ZodError) {
      redirect(
        `/app/requests/messages/${conversationId.data}?messageError=send`,
      );
    }

    throw error;
  }
}
