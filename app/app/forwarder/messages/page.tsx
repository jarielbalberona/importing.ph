import Link from "next/link";

import {
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
} from "@/components/app-shell";
import { formatDateTime, formatStructuredRoute } from "@/lib/format";
import { getConversationsForCurrentForwarder } from "@/lib/messages";
import { ForwarderMessagesRealtime } from "./forwarder-messages-realtime";

export const dynamic = "force-dynamic";

export default async function ForwarderMessagesPage() {
  const conversations = await getConversationsForCurrentForwarder();

  return (
    <>
      <PageHeader
        title="Messages"
        description="Continue conversations with importers after your company sends a quote."
      />

      <ForwarderMessagesRealtime
        conversationIds={conversations.map((conversation) => conversation.id)}
      >
        {conversations.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No conversations yet"
              description="Messages are available after your company sends a quote for a shipment request."
            />
          </div>
        ) : (
          <section className="mt-8 grid gap-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/app/forwarder/messages/${conversation.id}`}
                className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/60 sm:p-5"
              >
                <article className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold">
                      {conversation.cargoDescription}
                    </h2>
                    <div className="mt-4">
                      <InfoGrid columns={2}>
                        <DetailValue
                          label="Route"
                          value={formatStructuredRoute(conversation)}
                        />
                        <DetailValue
                          label="Updated"
                          value={formatDateTime(conversation.updatedAt)}
                        />
                      </InfoGrid>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-cyan-800">
                    Open thread
                  </span>
                </article>
              </Link>
            ))}
          </section>
        )}
      </ForwarderMessagesRealtime>
    </>
  );
}
