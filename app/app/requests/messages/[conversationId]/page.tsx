import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Importer</p>
            <h1 className="text-3xl font-semibold">
              {conversation.forwarderCompanyName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {conversation.cargoDescription}
            </p>
          </div>
          <UserButton />
        </header>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/app/requests/messages">Back to messages</Link>
          </Button>
          <Button asChild variant="outline">
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
            Message could not be sent.
          </div>
        ) : null}

        <section className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
          {conversation.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="grid gap-4">
              {conversation.messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          )}
        </section>

        <form action={sendImporterMessage} className="mt-6 grid gap-3">
          <input
            type="hidden"
            name="conversationId"
            value={conversation.id}
          />
          <textarea
            name="body"
            required
            rows={4}
            maxLength={2000}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Write a message"
          />
          <div>
            <Button type="submit">Send message</Button>
          </div>
        </form>
      </div>
    </main>
  );
}

type MessageItemProps = {
  message: NonNullable<
    Awaited<ReturnType<typeof getConversationForCurrentImporter>>
  >["messages"][number];
};

function MessageItem({ message }: MessageItemProps) {
  return (
    <article className="rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">{message.senderName}</p>
        <p className="text-xs uppercase text-muted-foreground">
          {message.senderRole}
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {message.createdAt.toLocaleString()}
      </p>
    </article>
  );
}
