import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  DetailCard,
  DetailValue,
  InfoGrid,
  PageHeader,
} from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatStructuredRoute } from "@/lib/format";
import { getConversationForCurrentForwarder } from "@/lib/messages";
import { ForwarderConversationClient } from "./forwarder-conversation-client";

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
    <>
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title={conversation.cargoDescription}
          description="Ask or answer follow-up questions about this shipment."
        />

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/forwarder/messages">Back to messages</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link
              href={`/app/forwarder/requests/${conversation.shipmentRequestId}`}
            >
              View request
            </Link>
          </Button>
        </div>

        <DetailCard title="Shipment request" className="mt-6">
          <InfoGrid>
            <DetailValue label="Request" value={conversation.cargoDescription} />
            <DetailValue
              label="Route"
              value={formatStructuredRoute(conversation)}
            />
          </InfoGrid>
        </DetailCard>

        <ForwarderConversationClient
          conversationId={conversation.id}
          messages={conversation.messages.map((message) => ({
            id: message.id,
            senderUserProfileId: message.senderUserProfileId,
            senderName: message.senderName,
            senderRole: message.senderRole,
            body: message.body,
            createdAt: formatDateTime(message.createdAt),
          }))}
          readStates={conversation.readStates.map((readState) => ({
            readerUserProfileId: readState.readerUserProfileId,
            lastReadMessageId: readState.lastReadMessageId,
            lastReadAt: readState.lastReadAt.toISOString(),
          }))}
          currentUserProfileId={conversation.currentUserProfileId}
          query={query}
        />
      </div>
    </>
  );
}
