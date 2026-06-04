import { notFound } from "next/navigation";
import { z } from "zod";

import { getConversationForCurrentImporter } from "@/lib/messages";
import { ImporterMessagesWorkspace } from "../importer-messages-workspace";

export const dynamic = "force-dynamic";

type ImporterConversationPageProps = {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ message?: string; messageError?: string }>;
};

const idSchema = z.string().uuid();

export default async function ImporterConversationPage({
  params,
  searchParams,
}: ImporterConversationPageProps) {
  const { conversationId } = await params;
  const query = await searchParams;
  const parsedConversationId = idSchema.safeParse(conversationId);

  if (!parsedConversationId.success) {
    notFound();
  }

  const conversation = await getConversationForCurrentImporter(
    parsedConversationId.data,
  );

  if (!conversation) {
    notFound();
  }

  return (
    <ImporterMessagesWorkspace
      activeConversationId={parsedConversationId.data}
      query={query}
    />
  );
}
