import Link from "next/link";

import {
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
} from "@/components/app-shell";
import { formatDateTime, formatRoute } from "@/lib/format";
import { getConversationsForCurrentImporter } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function ImporterMessagesPage() {
  const conversations = await getConversationsForCurrentImporter();

  return (
    <>
      <PageHeader
        eyebrow="Importer"
        title="Messages"
        description="Continue conversations with forwarders after they send quotes."
      />

        {conversations.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No conversations yet"
              description="Messages are available after a forwarder sends a quote on one of your shipment requests."
            />
          </div>
        ) : (
          <section className="mt-8 grid gap-4">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/app/requests/messages/${conversation.id}`}
                  className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/60 sm:p-5"
                >
                  <article className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold">
                      {conversation.forwarderCompanyName}
                    </h2>
                    <p className="mt-2 break-words text-sm text-muted-foreground">
                      {conversation.cargoDescription}
                    </p>
                    <div className="mt-4">
                      <InfoGrid columns={2}>
                        <DetailValue
                          label="Route"
                          value={formatRoute(conversation.origin, conversation.destination)}
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
    </>
  );
}
