import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getConversationsForCurrentImporter } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function ImporterMessagesPage() {
  const conversations = await getConversationsForCurrentImporter();

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Importer</p>
            <h1 className="text-3xl font-semibold">Messages</h1>
          </div>
          <UserButton />
        </header>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/app/requests">Back to requests</Link>
          </Button>
        </div>

        {conversations.length === 0 ? (
          <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">No conversations yet</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Conversations open from quotes on your shipment requests.
            </p>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="grid divide-y">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/app/requests/messages/${conversation.id}`}
                  className="grid gap-3 p-5 transition-colors hover:bg-muted/60 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h2 className="font-semibold">
                      {conversation.forwarderCompanyName}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {conversation.cargoDescription}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {conversation.origin} to {conversation.destination}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conversation.updatedAt.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
