import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  DetailCard,
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatRoute, titleFromEnum } from "@/lib/format";
import { getConversationForCurrentImporter } from "@/lib/messages";
import { sendImporterMessage } from "./actions";

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
    <>
      <div className="mx-auto max-w-4xl">
        <PageHeader
          eyebrow="Importer"
          title={conversation.forwarderCompanyName}
          description="Ask follow-up questions about this shipment."
        />

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/requests/messages">Back to messages</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/app/requests/${conversation.shipmentRequestId}`}>
              View request
            </Link>
          </Button>
        </div>

        {query.message === "sent" ? (
          <div className="mt-6 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
            Message sent.
          </div>
        ) : null}

        {query.messageError ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Message was not sent. Try again.
          </div>
        ) : null}

        <DetailCard title="Shipment request" className="mt-6">
          <InfoGrid>
            <DetailValue label="Request" value={conversation.cargoDescription} />
            <DetailValue
              label="Route"
              value={formatRoute(conversation.origin, conversation.destination)}
            />
            <DetailValue label="Forwarder" value={conversation.forwarderCompanyName} />
          </InfoGrid>
        </DetailCard>

        <DetailCard
          title="Thread"
          description="Messages are not live. Refresh the page to check for new replies."
          className="mt-6"
        >
          {conversation.messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Ask a follow-up question about this shipment."
            />
          ) : (
            <div className="grid gap-4">
              {conversation.messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          )}
        </DetailCard>

        <form
          action={sendImporterMessage}
          className="mt-6 grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:p-5"
        >
          <input
            type="hidden"
            name="conversationId"
            value={conversation.id}
          />
          <Textarea
            name="body"
            required
            rows={4}
            maxLength={2000}
            placeholder="Ask a follow-up question about this shipment."
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Keep the message focused on shipment details, documents, quote
            scope, or delivery questions.
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
      </div>
    </>
  );
}

type MessageItemProps = {
  message: NonNullable<
    Awaited<ReturnType<typeof getConversationForCurrentImporter>>
  >["messages"][number];
};

function MessageItem({ message }: MessageItemProps) {
  return (
    <article className="min-w-0 rounded-md border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-medium">{message.senderName}</p>
          <StatusBadge>{titleFromEnum(message.senderRole)}</StatusBadge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(message.createdAt)}
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
        {message.body}
      </p>
    </article>
  );
}
