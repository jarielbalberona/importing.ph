import { notFound } from "next/navigation";
import { z } from "zod";

import { getConversationForCurrentForwarder } from "@/lib/messages";
import { ForwarderMessagesWorkspace } from "../forwarder-messages-workspace";

export const dynamic = "force-dynamic";

type ForwarderConversationPageProps = {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ message?: string; messageError?: string }>;
};

const idSchema = z.string().uuid();

export default async function ForwarderConversationPage({
  params,
  searchParams,
}: ForwarderConversationPageProps) {
  const { conversationId } = await params;
  const query = await searchParams;
  const parsedConversationId = idSchema.safeParse(conversationId);

  if (!parsedConversationId.success) {
    notFound();
  }

  const conversation = await getConversationForCurrentForwarder(
    parsedConversationId.data,
  );

  if (!conversation) {
    notFound();
  }

  return (
    <ForwarderMessagesWorkspace
      activeConversationId={parsedConversationId.data}
      query={query}
    />
  );
}
