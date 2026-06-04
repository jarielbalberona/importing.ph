"use client";

import Link from "next/link";
import { ArrowLeftIcon, HelpCircleIcon, InfoIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ShipmentQuoteDetailsDialog,
  type ShipmentQuoteDetails,
} from "@/components/requests/shipment-quote-details-dialog";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type ClientRealtimeEvent,
  useRealtime,
} from "@/components/realtime-provider";
import { sendImporterMessage } from "./[conversationId]/actions";

export type ImporterConversationView = {
  id: string;
  href: string;
  isActive: boolean;
  forwarderCompanyName: string;
  forwarderContactPerson: string | null;
  forwarderOriginCities: string | null;
  forwarderDestinationAreas: string | null;
  forwarderShippingModes: string | null;
  forwarderServiceDescription: string | null;
  cargoDescription: string;
  route: string;
  preview: string;
  updatedAt: string;
  shipment: ShipmentQuoteDetails["request"];
  quote: ShipmentQuoteDetails["quote"];
  messages: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    body: string;
    createdAt: string;
  }>;
};

type ImporterMessagesClientProps = {
  conversations: ImporterConversationView[];
  activeConversation?: ImporterConversationView;
  query?: {
    message?: string;
    messageError?: string;
  };
};

export function ImporterMessagesClient({
  conversations,
  activeConversation,
  query,
}: ImporterMessagesClientProps) {
  const router = useRouter();
  const realtime = useRealtime();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<
    Record<string, ImporterConversationView["messages"]>
  >({});
  const [conversationPatches, setConversationPatches] = useState<
    Record<
      string,
      {
        preview: string;
        updatedAt: string;
        sortRank: number;
      }
    >
  >({});
  const currentConversation = useMemo(() => {
    if (!activeConversation) {
      return undefined;
    }

    const appendedMessages = realtimeMessages[activeConversation.id] ?? [];
    const seenMessageIds = new Set(activeConversation.messages.map((message) => message.id));
    const mergedMessages = [
      ...activeConversation.messages,
      ...appendedMessages.filter((message) => !seenMessageIds.has(message.id)),
    ];

    return {
      ...activeConversation,
      messages: mergedMessages,
    };
  }, [activeConversation, realtimeMessages]);
  const conversationList = useMemo(() => {
    return conversations
      .map((conversation) => {
        const patch = conversationPatches[conversation.id];

        if (!patch) {
          return conversation;
        }

        return {
          ...conversation,
          preview: patch.preview,
          updatedAt: patch.updatedAt,
          sortRank: patch.sortRank,
        };
      })
      .sort((a, b) => {
        const aRank = "sortRank" in a ? a.sortRank : 0;
        const bRank = "sortRank" in b ? b.sortRank : 0;

        return bRank - aRank;
      });
  }, [conversationPatches, conversations]);
  const handleRealtimeEvent = useCallback(
    (event: ClientRealtimeEvent) => {
      if (
        event.type === "conversation.message.created" &&
        event.conversationId === activeConversation?.id
      ) {
        setRealtimeMessages((messagesByConversationId) => {
          const currentMessages =
            messagesByConversationId[event.conversationId] ?? [];
          const canonicalMessageExists = activeConversation.messages.some(
            (message) => message.id === event.message.id,
          );
          const realtimeMessageExists = currentMessages.some(
            (message) => message.id === event.message.id,
          );

          if (canonicalMessageExists || realtimeMessageExists) {
            return messagesByConversationId;
          }

          return {
            ...messagesByConversationId,
            [event.conversationId]: [
              ...currentMessages,
              {
                id: event.message.id,
                senderName: event.message.senderName,
                senderRole: event.message.senderRole,
                body: event.message.body,
                createdAt: new Date(event.message.createdAt).toLocaleString(),
              },
            ],
          };
        });
      }

      if (event.type === "conversation.updated") {
        setConversationPatches((patches) => {
          if (!conversations.some((conversation) => conversation.id === event.conversationId)) {
            return patches;
          }

          return {
            ...patches,
            [event.conversationId]: {
              preview: event.latestMessagePreview,
              updatedAt: new Date(event.updatedAt).toLocaleDateString(),
              sortRank: Date.now(),
            },
          };
        });

        router.refresh();
      }
    },
    [activeConversation, conversations, router],
  );
  const realtimeStatus = realtime.status;

  useEffect(
    () => realtime.addListener(handleRealtimeEvent),
    [handleRealtimeEvent, realtime],
  );

  useEffect(() => {
    const conversationIds = conversations.map((conversation) => conversation.id);

    for (const conversationId of conversationIds) {
      realtime.subscribe(conversationId);
    }

    return () => {
      for (const conversationId of conversationIds) {
        realtime.unsubscribe(conversationId);
      }
    };
  }, [conversations, realtime]);

  return (
    <section
      className={cn(
        "h-[calc(100svh-7rem)] min-h-0 overflow-hidden rounded-lg border bg-background md:h-[calc(100svh-3rem)] lg:grid lg:h-[calc(100svh-5rem)]",
        activeConversation && detailsOpen
          ? "lg:grid-cols-[13rem_minmax(0,1fr)_12rem] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]"
          : "lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]",
      )}
    >
      <ConversationList
        conversations={conversationList}
        className={activeConversation ? "hidden lg:flex" : undefined}
      />

      {currentConversation ? (
        <>
          <MessageWindow
            conversation={currentConversation}
            query={query}
            realtimeStatus={realtimeStatus}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((value) => !value)}
          />
          {detailsOpen ? (
            <ConversationDetails
              conversation={currentConversation}
              className="hidden lg:block"
            />
          ) : null}
        </>
      ) : (
        <>
          <div className="hidden h-full min-h-0 place-items-center border-r p-6 lg:grid">
            <div className="max-w-sm text-center">
              <h2 className="text-lg font-semibold">Select a conversation</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Select a conversation to view messages.
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ConversationList({
  conversations,
  className,
}: {
  conversations: ImporterConversationView[];
  className?: string;
}) {
  const [search, setSearch] = useState("");
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [
        conversation.forwarderCompanyName,
        conversation.cargoDescription,
        conversation.route,
        conversation.preview,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [conversations, search]);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-b bg-background lg:border-r lg:border-b-0",
        className,
      )}
    >
      <div className="border-b p-4">
        <Input
          type="search"
          placeholder="Search conversations"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search conversations"
        />
      </div>

      {filteredConversations.length === 0 ? (
        <div className="p-4 text-sm leading-6 text-muted-foreground">
          No matching conversations.
        </div>
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={conversation.href}
              aria-current={conversation.isActive ? "page" : undefined}
              className={
                conversation.isActive
                  ? "block border-l-2 border-primary bg-muted px-4 py-3"
                  : "block border-l-2 border-transparent px-4 py-3 transition-colors hover:bg-muted/60"
              }
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <p className="min-w-0 truncate font-medium">
                  {conversation.forwarderCompanyName}
                </p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {conversation.updatedAt}
                </p>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {conversation.cargoDescription}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {conversation.route}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-5">
                {conversation.preview}
              </p>
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
}

function MessageWindow({
  conversation,
  query,
  realtimeStatus,
  detailsOpen,
  onToggleDetails,
}: {
  conversation: ImporterConversationView;
  query?: {
    message?: string;
    messageError?: string;
  };
  realtimeStatus: string;
  detailsOpen: boolean;
  onToggleDetails: () => void;
}) {
  return (
    <main className="flex h-full min-h-0 min-w-0 flex-col bg-muted/20 lg:border-r">
      <div className="border-b bg-background p-3 sm:p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
            >
              <Link href="/app/requests/messages" aria-label="Back to messages">
                <ArrowLeftIcon />
              </Link>
            </Button>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold sm:text-lg">
                {conversation.forwarderCompanyName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Shipment quote conversation
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {conversation.cargoDescription} / {conversation.route}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ShipmentQuoteDetailsDialog
              context={{ request: conversation.shipment, quote: conversation.quote }}
              trigger={
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  View Details
                </Button>
              }
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Show conversation details"
                >
                  <InfoIcon />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[88vw] overflow-y-auto" side="right">
                <SheetHeader>
                  <SheetTitle>Conversation details</SheetTitle>
                  <SheetDescription>
                    Forwarder details and shipment context.
                  </SheetDescription>
                </SheetHeader>
                <ConversationDetails conversation={conversation} compact />
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:inline-flex"
              aria-label={
                detailsOpen
                  ? "Hide conversation details"
                  : "Show conversation details"
              }
              onClick={onToggleDetails}
            >
              <InfoIcon />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b bg-background/70 px-4 py-2 text-xs text-muted-foreground">
        {realtimeStatus === "connected"
          ? "Live updates connected."
          : realtimeStatus === "reconnecting"
            ? "Reconnecting. Messages still send normally."
            : "Connecting live updates. Messages still send normally."}
      </div>

      {query?.message === "sent" ? (
        <div className="border-b border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          Message sent.
        </div>
      ) : null}

      {query?.messageError ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Message was not sent. Try again.
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {conversation.messages.length === 0 ? (
          <div className="grid h-full min-h-64 place-items-center text-center">
            <div>
              <h3 className="text-base font-semibold">No messages yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask a follow-up question about this shipment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <form action={sendImporterMessage} className="border-t bg-background p-3">
        <input type="hidden" name="conversationId" value={conversation.id} />
        <Textarea
          name="body"
          required
          rows={2}
          maxLength={2000}
          placeholder="Ask about shipment details, documents, quote scope, pickup, delivery, or payment questions."
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Message guidance"
              >
                <HelpCircleIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <div className="grid gap-2 text-sm leading-6">
                <p>
                  Keep messages focused on shipment details, documents, quote
                  scope, pickup, delivery, or payment questions.
                </p>
                <p className="text-muted-foreground">
                  Avoid sending private payment details unless you are ready to
                  share them with this forwarder.
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <PendingSubmitButton type="submit" pendingText="Sending...">
            Send
          </PendingSubmitButton>
        </div>
      </form>
    </main>
  );
}

function ConversationDetails({
  conversation,
  className,
  compact = false,
}: {
  conversation: ImporterConversationView;
  className?: string;
  compact?: boolean;
}) {
  return (
    <aside
      className={cn("h-full min-h-0 min-w-0 overflow-y-auto bg-background", className)}
    >
      <section className={compact ? "border-b p-4" : "border-b p-5"}>
        <h2 className="text-base font-semibold">Forwarder details</h2>
        <dl className="mt-4 grid gap-4 text-sm">
          <Detail label="Company" value={conversation.forwarderCompanyName} />
          <Detail label="Contact" value={conversation.forwarderContactPerson} />
          <Detail label="Shipping modes" value={conversation.forwarderShippingModes} />
          <Detail label="Profile" value={conversation.forwarderServiceDescription} />
          <Detail label="Origin cities" value={conversation.forwarderOriginCities} />
          <Detail
            label="Destination areas"
            value={conversation.forwarderDestinationAreas}
          />
        </dl>
      </section>

      <section className={compact ? "p-4" : "p-5"}>
        <h2 className="text-base font-semibold">Shipments</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <p className="font-medium">{conversation.cargoDescription}</p>
          <p className="leading-6 text-muted-foreground">
            {conversation.route}
          </p>
          <div className="flex flex-wrap gap-2">
            <RequestStatusBadge status={conversation.shipment.status} />
            <Badge variant="outline">{conversation.quote.status}</Badge>
          </div>
          <ShipmentQuoteDetailsDialog
            context={{ request: conversation.shipment, quote: conversation.quote }}
            trigger={
              <Button variant="outline" size="sm" className="w-fit">
                View Details
              </Button>
            }
          />
        </div>
      </section>
    </aside>
  );
}

type Message = ImporterConversationView["messages"][number];

function MessageBubble({ message }: { message: Message }) {
  const isImporter = message.senderRole === "importer";

  return (
    <article
      className={
        isImporter
          ? "ml-auto grid max-w-[82%] justify-items-end gap-1"
          : "mr-auto grid max-w-[82%] justify-items-start gap-1"
      }
    >
      <div
        className={
          isImporter
            ? "rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground"
            : "rounded-2xl rounded-bl-sm bg-background px-4 py-3 shadow-sm ring-1 ring-border"
        }
      >
        {!isImporter ? (
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {message.senderName}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.body}
        </p>
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        {message.createdAt}
      </p>
    </article>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words leading-6">{value}</dd>
    </div>
  );
}
