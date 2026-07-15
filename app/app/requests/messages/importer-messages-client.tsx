"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  CheckCheckIcon,
  CheckIcon,
  HelpCircleIcon,
  InfoIcon,
  FileIcon,
  PaperclipIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  ShipmentQuoteDetailsDialog,
  type ShipmentQuoteDetails,
} from "@/components/requests/shipment-quote-details-dialog";
import { QueryStateToast } from "@/components/query-state-toast";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
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
import {
  markImporterConversationRead,
  sendImporterMessage,
} from "./[conversationId]/actions";
import type { MessageSendResult } from "@/lib/messages";
import type { MessageAttachment } from "@/lib/message-attachments";
import {
  formatBytes,
  messageAttachmentMaxCount,
  messageAttachmentMaxTotalBytes,
  maxBytesForMessageContentType,
} from "@/lib/file-rules";

export type ImporterConversationView = {
  id: string;
  href: string;
  isActive: boolean;
  counterpartyName: string;
  counterpartyDetails: Array<{
    label: string;
    value: React.ReactNode;
  }>;
  forwarderCompanyName: string;
  forwarderContactPerson: string | null;
  forwarderOriginCities: string | null;
  forwarderDestinationAreas: string | null;
  forwarderShippingModes: string | null;
  forwarderServiceDescription: string | null;
  cargoDescription: string;
  route: string;
  preview: string;
  hasUnread: boolean;
  updatedAt: string;
  shipment: ShipmentQuoteDetails["request"];
  quote: ShipmentQuoteDetails["quote"];
  messages: Array<{
    id: string;
    senderUserProfileId: string;
    senderName: string;
    senderRole: string;
    body: string;
    attachments: MessageAttachment[];
    createdAt: string;
  }>;
  readStates: Array<{
    readerUserProfileId: string;
    lastReadMessageId: string;
    lastReadAt: string;
  }>;
  currentUserProfileId: string | null;
};

type ConversationListItem = ImporterConversationView & {
  sortRank?: number;
};

type ImporterMessagesClientProps = {
  conversations: ImporterConversationView[];
  activeConversation?: ImporterConversationView;
  query?: {
    message?: string;
    messageError?: string;
  };
  baseHref?: string;
  detailsTitle?: string;
  detailsSheetDescription?: string;
  emptyMessageDescription?: string;
  markConversationReadAction?: typeof markImporterConversationRead;
  sendMessageAction?: SendMessageAction;
};

type SendMessageAction = (formData: FormData) => Promise<MessageSendResult>;

export function ImporterMessagesClient({
  conversations,
  activeConversation,
  query,
  baseHref = "/app/requests/messages",
  detailsTitle = "Conversation details",
  detailsSheetDescription = "Forwarder details and shipment context.",
  emptyMessageDescription = "Ask a follow-up question about this shipment.",
  markConversationReadAction = markImporterConversationRead,
  sendMessageAction = sendImporterMessage,
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
  const [readStatePatches, setReadStatePatches] = useState<
    Record<string, ImporterConversationView["readStates"]>
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
    const readStatesByReader = new Map(
      activeConversation.readStates.map((readState) => [
        readState.readerUserProfileId,
        readState,
      ]),
    );

    for (const readState of readStatePatches[activeConversation.id] ?? []) {
      readStatesByReader.set(readState.readerUserProfileId, readState);
    }

    return {
      ...activeConversation,
      messages: mergedMessages,
      readStates: Array.from(readStatesByReader.values()),
      hasUnread: getConversationUnreadState({
        ...activeConversation,
        messages: mergedMessages,
        readStates: Array.from(readStatesByReader.values()),
      }),
    };
  }, [activeConversation, readStatePatches, realtimeMessages]);
  const conversationList = useMemo<ConversationListItem[]>(() => {
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
          hasUnread:
            currentConversation?.id === conversation.id
              ? currentConversation.hasUnread
              : conversation.hasUnread,
          sortRank: patch.sortRank,
        };
      })
      .map((conversation) =>
        currentConversation?.id === conversation.id
          ? {
              ...conversation,
              hasUnread: currentConversation.hasUnread,
            }
          : conversation,
      )
      .sort((a: ConversationListItem, b: ConversationListItem) => {
        const aRank = typeof a.sortRank === "number" ? a.sortRank : 0;
        const bRank = typeof b.sortRank === "number" ? b.sortRank : 0;

        return bRank - aRank;
      });
  }, [conversationPatches, conversations, currentConversation]);
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
                senderUserProfileId: event.message.senderUserProfileId,
                senderName: event.message.senderName,
                senderRole: event.message.senderRole,
                body: event.message.body,
                attachments: event.message.attachments,
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

      if (event.type === "conversation.read_state.updated") {
        setReadStatePatches((patches) =>
          mergeReadStatePatch(patches, {
            conversationId: event.conversationId,
            readerUserProfileId: event.readerUserProfileId,
            lastReadMessageId: event.lastReadMessageId,
            lastReadAt: event.lastReadAt,
          }),
        );
      }
    },
    [activeConversation, conversations, router],
  );
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

  useEffect(() => {
    if (!currentConversation?.currentUserProfileId || !currentConversation.hasUnread) {
      return;
    }

    const latestMessage = currentConversation.messages.at(-1);

    if (
      !latestMessage ||
      latestMessage.senderUserProfileId === currentConversation.currentUserProfileId
    ) {
      return;
    }

    let cancelled = false;

    markConversationReadAction({
      conversationId: currentConversation.id,
      lastReadMessageId: latestMessage.id,
    })
      .then((readState) => {
        if (cancelled) {
          return;
        }

        setReadStatePatches((patches) =>
          mergeReadStatePatch(patches, {
            conversationId: currentConversation.id,
            readerUserProfileId: readState.readerUserProfileId,
            lastReadMessageId: readState.lastReadMessageId,
            lastReadAt: readState.lastReadAt,
          }),
        );

        realtime.emitLocal({
          type: "conversation.read_state.updated",
          version: 1,
          eventId: `local:conversation:${currentConversation.id}:read:${readState.readerUserProfileId}:${readState.lastReadMessageId}`,
          occurredAt: new Date().toISOString(),
          conversationId: currentConversation.id,
          readerUserProfileId: readState.readerUserProfileId,
          lastReadMessageId: readState.lastReadMessageId,
          lastReadAt: readState.lastReadAt,
        });
      })
      .catch(() => {
        // Do not fake seen/read state if the server-side write fails.
      });

    return () => {
      cancelled = true;
    };
  }, [currentConversation, markConversationReadAction, realtime]);

  return (
    <section
      className={cn(
        "h-full min-h-0 overflow-hidden rounded-lg border bg-background lg:grid",
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
            baseHref={baseHref}
            detailsTitle={detailsTitle}
            detailsSheetDescription={detailsSheetDescription}
            emptyMessageDescription={emptyMessageDescription}
            sendMessageAction={sendMessageAction}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((value) => !value)}
          />
          {detailsOpen ? (
            <ConversationDetails
              conversation={currentConversation}
              title={detailsTitle}
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
  conversations: ConversationListItem[];
  className?: string;
}) {
  const [search, setSearch] = useState("");
  const unreadCount = conversations.filter(
    (conversation) => conversation.hasUnread,
  ).length;
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [
        conversation.counterpartyName,
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
      <div className="grid gap-3 border-b p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Inbox</h2>
            <p className="text-xs text-muted-foreground">
              {conversations.length} conversations
            </p>
          </div>
          {unreadCount > 0 ? (
            <Badge className="shrink-0">{unreadCount} unread</Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              All read
            </Badge>
          )}
        </div>
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
              className={cn(
                "block border-l-2 px-4 py-3 transition-colors",
                conversation.isActive
                  ? "border-primary bg-muted"
                  : conversation.hasUnread
                    ? "border-amber-500 bg-amber-50/80 hover:bg-amber-50"
                    : "border-transparent hover:bg-muted/60",
              )}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "min-w-0 truncate font-medium",
                      conversation.hasUnread && !conversation.isActive
                        ? "text-foreground"
                        : "text-foreground/90",
                    )}
                  >
                    {conversation.counterpartyName}
                  </p>
                  <Badge
                    variant={
                      conversation.hasUnread && !conversation.isActive
                        ? "default"
                        : "outline"
                    }
                    className="mt-1 h-5 px-1.5 text-[0.68rem]"
                  >
                    {conversation.hasUnread && !conversation.isActive
                      ? "Unread"
                      : "Read"}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-xs",
                    conversation.hasUnread && !conversation.isActive
                      ? "font-medium text-amber-700"
                      : "text-muted-foreground",
                  )}
                >
                  {conversation.updatedAt}
                </p>
              </div>
              <p
                className={cn(
                  "mt-1 truncate text-sm",
                  conversation.hasUnread && !conversation.isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {conversation.cargoDescription}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {conversation.route}
              </p>
              <p
                className={cn(
                  "mt-2 line-clamp-2 text-sm leading-5",
                  conversation.hasUnread && !conversation.isActive
                    ? "font-medium text-foreground"
                    : "text-foreground/90",
                )}
              >
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
  baseHref,
  detailsTitle,
  detailsSheetDescription,
  emptyMessageDescription,
  sendMessageAction,
  detailsOpen,
  onToggleDetails,
}: {
  conversation: ImporterConversationView;
  query?: {
    message?: string;
    messageError?: string;
  };
  baseHref: string;
  detailsTitle: string;
  detailsSheetDescription: string;
  emptyMessageDescription: string;
  sendMessageAction: SendMessageAction;
  detailsOpen: boolean;
  onToggleDetails: () => void;
}) {
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadsRef = useRef(new Map<string, XMLHttpRequest>());
  const previewUrlsRef = useRef(new Set<string>());
  const [draft, setDraft] = useState("");
  const [composerAttachments, setComposerAttachments] = useState<
    ComposerAttachment[]
  >([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<DisplayMessage[]>([]);
  const [isSending, startSending] = useTransition();
  const canonicalMessageIds = new Set(
    conversation.messages.map((message) => message.id),
  );
  const displayedMessages: DisplayMessage[] = [
    ...conversation.messages,
    ...optimisticMessages.filter(
      (message) => !canonicalMessageIds.has(message.id),
    ),
  ];
  const displayConversation = { ...conversation, messages: displayedMessages };
  const latestSeenOutgoingMessageId =
    getLatestSeenOutgoingMessageId(displayConversation);
  const latestMessageId = displayedMessages.at(-1)?.id;
  const hasPendingUploads = composerAttachments.some(
    (attachment) => attachment.status === "uploading",
  );
  const hasFailedUploads = composerAttachments.some(
    (attachment) => attachment.status === "error",
  );

  useEffect(() => {
    const activeUploads = activeUploadsRef.current;
    const previewUrls = previewUrlsRef.current;
    return () => {
      for (const upload of activeUploads.values()) upload.abort();
      for (const previewUrl of previewUrls) URL.revokeObjectURL(previewUrl);
      activeUploads.clear();
      previewUrls.clear();
    };
  }, []);

  async function uploadAttachment(item: ComposerAttachment) {
    setComposerAttachments((items) =>
      items.map((current) =>
        current.localId === item.localId
          ? { ...current, status: "uploading", progress: 0, error: undefined }
          : current,
      ),
    );

    let fileId: string | undefined;
    try {
      const contentType = normalizedContentType(item.file);
      const authorizationResponse = await fetch(
        "/api/media/message-attachments/authorize",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation.id,
            filename: item.file.name,
            contentType,
            sizeBytes: item.file.size,
          }),
        },
      );
      const authorization = (await authorizationResponse.json()) as {
        upload?: { fileId: string; uploadUrl: string };
        message?: string;
      };
      if (!authorizationResponse.ok || !authorization.upload) {
        throw new Error(authorization.message || "Upload could not be authorized.");
      }
      fileId = authorization.upload.fileId;
      setComposerAttachments((items) =>
        items.map((current) =>
          current.localId === item.localId ? { ...current, fileId } : current,
        ),
      );

      await uploadDirectlyToR2({
        localId: item.localId,
        file: item.file,
        contentType,
        uploadUrl: authorization.upload.uploadUrl,
        activeUploads: activeUploadsRef.current,
        onProgress(progress) {
          setComposerAttachments((items) =>
            items.map((current) =>
              current.localId === item.localId ? { ...current, progress } : current,
            ),
          );
        },
      });

      const finalizeResponse = await fetch(
        `/api/media/message-attachments/${fileId}/finalize`,
        { method: "POST" },
      );
      const finalized = (await finalizeResponse.json()) as {
        file?: MessageAttachment;
        message?: string;
      };
      if (!finalizeResponse.ok || !finalized.file) {
        throw new Error(finalized.message || "Upload validation failed.");
      }
      setComposerAttachments((items) =>
        items.map((current) =>
          current.localId === item.localId
            ? {
                ...current,
                fileId,
                attachment: finalized.file,
                status: "ready",
                progress: 100,
              }
            : current,
        ),
      );
    } catch (error) {
      setComposerAttachments((items) =>
        items.map((current) =>
          current.localId === item.localId
            ? {
                ...current,
                fileId,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed.",
              }
            : current,
        ),
      );
    }
  }

  function selectAttachments(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const combined = [...composerAttachments.map((item) => item.file), ...files];
    if (combined.length > messageAttachmentMaxCount) {
      setSendError("A message can contain up to 5 attachments.");
      return;
    }
    if (combined.reduce((sum, file) => sum + file.size, 0) > messageAttachmentMaxTotalBytes) {
      setSendError("Attachments for one message cannot exceed 100 MB total.");
      return;
    }

    const additions: ComposerAttachment[] = [];
    for (const file of files) {
      const contentType = normalizedContentType(file);
      if (!contentType || file.size > maxBytesForMessageContentType(contentType)) {
        setSendError(
          `${file.name} exceeds the allowed size or has an unsupported file type.`,
        );
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      additions.push({
        localId: crypto.randomUUID(),
        file,
        previewUrl,
        status: "uploading",
        progress: 0,
      });
    }
    if (additions.length === 0) return;
    setSendError(null);
    setComposerAttachments((items) => [...items, ...additions]);
    for (const addition of additions) void uploadAttachment(addition);
  }

  async function removeAttachment(item: ComposerAttachment) {
    activeUploadsRef.current.get(item.localId)?.abort();
    activeUploadsRef.current.delete(item.localId);
    if (item.fileId) {
      await fetch(`/api/media/message-attachments/${item.fileId}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
    URL.revokeObjectURL(item.previewUrl);
    previewUrlsRef.current.delete(item.previewUrl);
    setComposerAttachments((items) =>
      items.filter((current) => current.localId !== item.localId),
    );
  }

  async function retryAttachment(item: ComposerAttachment) {
    if (item.fileId) {
      await fetch(`/api/media/message-attachments/${item.fileId}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
    await uploadAttachment({ ...item, fileId: undefined, attachment: undefined });
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();

    const attachments = composerAttachments.filter(
      (attachment): attachment is ReadyComposerAttachment =>
        attachment.status === "ready" && Boolean(attachment.fileId && attachment.attachment),
    );

    if (
      (!body && attachments.length === 0) ||
      isSending ||
      hasPendingUploads ||
      hasFailedUploads ||
      !conversation.currentUserProfileId
    ) {
      return;
    }

    const temporaryId = `optimistic:${crypto.randomUUID()}`;
    const optimisticMessage: DisplayMessage = {
      id: temporaryId,
      senderUserProfileId: conversation.currentUserProfileId,
      senderName: "You",
      senderRole: "",
      body,
      attachments: attachments.map((item) => ({
        ...item.attachment,
        downloadUrl: item.previewUrl,
      })),
      createdAt: "Sending…",
      deliveryStatus: "sending",
    };

    setSendError(null);
    setDraft("");
    setComposerAttachments([]);
    setOptimisticMessages((messages) => [...messages, optimisticMessage]);

    const formData = new FormData();
    formData.set("conversationId", conversation.id);
    formData.set("body", body);
    formData.set(
      "attachmentIds",
      JSON.stringify(attachments.map((attachment) => attachment.fileId)),
    );

    startSending(async () => {
      let result: MessageSendResult;

      try {
        result = await sendMessageAction(formData);
      } catch {
        setOptimisticMessages((messages) =>
          messages.filter((message) => message.id !== temporaryId),
        );
        setDraft(body);
        setComposerAttachments(attachments);
        setSendError(
          "Message was not sent. Your text has been restored so you can try again.",
        );
        return;
      }

      if (result.status === "sent") {
        for (const attachment of attachments) {
          URL.revokeObjectURL(attachment.previewUrl);
          previewUrlsRef.current.delete(attachment.previewUrl);
        }
        setOptimisticMessages((messages) => [
          ...messages.filter((message) => message.id !== temporaryId),
          {
            ...result.message,
            createdAt: new Date(result.message.createdAt).toLocaleString(),
            deliveryStatus: "sent",
          },
        ]);
        return;
      }

      setOptimisticMessages((messages) =>
        messages.filter((message) => message.id !== temporaryId),
      );
      setDraft(body);
      setComposerAttachments(attachments);
      setSendError(messageSendError(result.code));
    });
  }

  useEffect(() => {
    const viewport = messagesViewportRef.current;

    if (!viewport) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [conversation.id, latestMessageId]);

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
              <Link href={baseHref} aria-label="Back to messages">
                <ArrowLeftIcon />
              </Link>
            </Button>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold sm:text-lg">
                {conversation.counterpartyName}
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
                  <SheetTitle>{detailsTitle}</SheetTitle>
                  <SheetDescription>
                    {detailsSheetDescription}
                  </SheetDescription>
                </SheetHeader>
                <ConversationDetails
                  conversation={conversation}
                  title={detailsTitle}
                  compact
                />
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

      <QueryStateToast
        errorMessage={
          query?.messageError === "rate_limited"
            ? "Too many messages. Wait a minute and try again."
            : query?.messageError
              ? "Message was not sent. Try again."
              : null
        }
        clearKeys={["messageError", "message"]}
      />

      <div ref={messagesViewportRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {displayedMessages.length === 0 ? (
          <div className="grid h-full min-h-64 place-items-center text-center">
            <div>
              <h3 className="text-base font-semibold">No messages yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {emptyMessageDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSeen={message.id === latestSeenOutgoingMessageId}
                currentUserProfileId={conversation.currentUserProfileId}
              />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="border-t bg-background p-3">
        {composerAttachments.length > 0 ? (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {composerAttachments.map((attachment) => (
              <ComposerAttachmentCard
                key={attachment.localId}
                attachment={attachment}
                disabled={isSending}
                onRemove={() => void removeAttachment(attachment)}
                onRetry={() => void retryAttachment(attachment)}
              />
            ))}
          </div>
        ) : null}
        <Textarea
          rows={2}
          maxLength={2000}
          value={draft}
          disabled={isSending}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about shipment details, documents, quote scope, pickup, delivery, or payment questions."
        />
        {sendError ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {sendError}
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="sr-only"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.xls,.xlsx,.csv"
              onChange={selectAttachments}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isSending || composerAttachments.length >= messageAttachmentMaxCount}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
            >
              <PaperclipIcon />
            </Button>
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
          </div>
          <Button
            type="submit"
            disabled={
              isSending ||
              hasPendingUploads ||
              hasFailedUploads ||
              (draft.trim().length === 0 && composerAttachments.length === 0)
            }
          >
            {isSending ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>
    </main>
  );
}

function ConversationDetails({
  conversation,
  title,
  className,
  compact = false,
}: {
  conversation: ImporterConversationView;
  title: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <aside
      className={cn("h-full min-h-0 min-w-0 overflow-y-auto bg-background", className)}
    >
      <section className={compact ? "border-b p-4" : "border-b p-5"}>
        <h2 className="text-base font-semibold">{title}</h2>
        <dl className="mt-4 grid gap-4 text-sm">
          {conversation.counterpartyDetails.map((detail) => (
            <Detail
              key={detail.label}
              label={detail.label}
              value={detail.value}
            />
          ))}
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
type DisplayMessage = Message & {
  deliveryStatus?: "sending" | "sent";
};

type ComposerAttachment = {
  localId: string;
  file: File;
  previewUrl: string;
  fileId?: string;
  attachment?: MessageAttachment;
  status: "uploading" | "ready" | "error";
  progress: number;
  error?: string;
};

type ReadyComposerAttachment = ComposerAttachment & {
  fileId: string;
  attachment: MessageAttachment;
  status: "ready";
};

function MessageBubble({
  message,
  isSeen,
  currentUserProfileId,
}: {
  message: DisplayMessage;
  isSeen: boolean;
  currentUserProfileId: string | null;
}) {
  const isOwnMessage = message.senderUserProfileId === currentUserProfileId;

  return (
    <article
      className={
        isOwnMessage
          ? "ml-auto grid max-w-[82%] justify-items-end gap-1"
          : "mr-auto grid max-w-[82%] justify-items-start gap-1"
      }
    >
      <div
        className={
          isOwnMessage
            ? "rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground"
            : "rounded-2xl rounded-bl-sm bg-background px-4 py-3 shadow-sm ring-1 ring-border"
        }
      >
        {message.attachments.length > 0 ? (
          <div className="grid gap-2">
            {message.attachments.map((attachment) => (
              <MessageAttachmentView
                key={attachment.id}
                attachment={attachment}
                isOwnMessage={isOwnMessage}
              />
            ))}
          </div>
        ) : null}
        {message.body ? (
          <p className={cn(
            "whitespace-pre-wrap break-words text-sm leading-6",
            message.attachments.length > 0 && "mt-2",
          )}>
            {message.body}
          </p>
        ) : null}
      </div>
      <p className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
        {message.deliveryStatus === "sending" ? "Sending…" : message.createdAt}
        {message.deliveryStatus === "sending" ? null : isSeen ? (
          <CheckCheckIcon className="size-3.5" aria-label="Seen" />
        ) : (
          <CheckIcon className="size-3" aria-label="Sent" />
        )}
      </p>
    </article>
  );
}

function MessageAttachmentView({
  attachment,
  isOwnMessage,
}: {
  attachment: MessageAttachment;
  isOwnMessage: boolean;
}) {
  if (attachment.contentType.startsWith("image/")) {
    return (
      <a
        href={attachment.downloadUrl}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-lg"
      >
        <Image
          src={attachment.downloadUrl}
          alt={attachment.originalFilename}
          width={480}
          height={320}
          unoptimized
          className="max-h-80 w-auto max-w-full object-contain"
        />
      </a>
    );
  }

  if (attachment.contentType.startsWith("video/")) {
    return (
      <video
        src={attachment.downloadUrl}
        controls
        preload="metadata"
        className="max-h-80 max-w-full rounded-lg"
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <a
      href={attachment.downloadUrl}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-lg border p-3 text-sm",
        isOwnMessage
          ? "border-primary-foreground/30 bg-primary-foreground/10"
          : "bg-muted/60",
      )}
    >
      <FileIcon className="size-5 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate font-medium">
          {attachment.originalFilename}
        </span>
        <span className="block text-xs opacity-75">
          {attachmentLabel(attachment.contentType)} / {formatBytes(attachment.sizeBytes)}
        </span>
      </span>
    </a>
  );
}

function ComposerAttachmentCard({
  attachment,
  disabled,
  onRemove,
  onRetry,
}: {
  attachment: ComposerAttachment;
  disabled: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="flex min-w-0 items-center gap-2">
        <FileIcon className="size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{attachment.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {attachment.status === "uploading"
              ? `Uploading ${attachment.progress}%`
              : attachment.status === "ready"
                ? `${formatBytes(attachment.file.size)} ready`
                : attachment.error || "Upload failed"}
          </p>
        </div>
        {attachment.status === "error" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onRetry}
            aria-label={`Retry ${attachment.file.name}`}
          >
            <RefreshCwIcon />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Remove ${attachment.file.name}`}
        >
          <XIcon />
        </Button>
      </div>
      {attachment.status === "uploading" ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${attachment.progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function uploadDirectlyToR2(input: {
  localId: string;
  file: File;
  contentType: string;
  uploadUrl: string;
  activeUploads: Map<string, XMLHttpRequest>;
  onProgress: (progress: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    input.activeUploads.set(input.localId, xhr);
    xhr.open("PUT", input.uploadUrl);
    xhr.setRequestHeader("Content-Type", input.contentType);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        input.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      input.activeUploads.delete(input.localId);
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Direct upload failed. Try again."));
    });
    xhr.addEventListener("error", () => {
      input.activeUploads.delete(input.localId);
      reject(new Error("Direct upload failed. Check your connection and retry."));
    });
    xhr.addEventListener("abort", () => {
      input.activeUploads.delete(input.localId);
      reject(new Error("Upload cancelled."));
    });
    xhr.send(input.file);
  });
}

function normalizedContentType(file: File) {
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  };
  return extension ? types[extension] ?? "" : "";
}

function attachmentLabel(contentType: string) {
  if (contentType === "application/pdf") return "PDF";
  if (contentType.includes("word")) return "Word document";
  if (contentType.includes("excel") || contentType.includes("spreadsheet")) {
    return "Spreadsheet";
  }
  if (contentType === "text/csv") return "CSV";
  return "File";
}

function getLatestSeenOutgoingMessageId(conversation: ImporterConversationView) {
  if (!conversation.currentUserProfileId) {
    return undefined;
  }

  const latestOutgoingIndex = conversation.messages.findLastIndex(
    (message) => message.senderUserProfileId === conversation.currentUserProfileId,
  );

  if (latestOutgoingIndex < 0) {
    return undefined;
  }

  const latestOutgoingMessage = conversation.messages[latestOutgoingIndex];
  const messageIndexById = new Map(
    conversation.messages.map((message, index) => [message.id, index]),
  );
  const isSeen = conversation.readStates.some((readState) => {
    if (readState.readerUserProfileId === conversation.currentUserProfileId) {
      return false;
    }

    const readIndex = messageIndexById.get(readState.lastReadMessageId);

    return readIndex !== undefined && readIndex >= latestOutgoingIndex;
  });

  return isSeen ? latestOutgoingMessage.id : undefined;
}

function getConversationUnreadState(conversation: ImporterConversationView) {
  if (!conversation.currentUserProfileId) {
    return false;
  }

  const latestMessage = conversation.messages.at(-1);

  if (!latestMessage) {
    return false;
  }

  if (latestMessage.senderUserProfileId === conversation.currentUserProfileId) {
    return false;
  }

  return !conversation.readStates.some(
    (readState) =>
      readState.readerUserProfileId === conversation.currentUserProfileId &&
      readState.lastReadMessageId === latestMessage.id,
  );
}

function messageSendError(
  code: Extract<MessageSendResult, { status: "error" }>["code"],
) {
  switch (code) {
    case "rate_limited":
      return "Too many messages. Wait a minute, then try again.";
    case "validation":
      return "Enter a message between 1 and 2,000 characters.";
    case "forbidden":
    case "invalid_conversation":
      return "This conversation is no longer available.";
    default:
      return "Message was not sent. Your text has been restored so you can try again.";
  }
}

function mergeReadStatePatch(
  patches: Record<string, ImporterConversationView["readStates"]>,
  patch: {
    conversationId: string;
    readerUserProfileId: string;
    lastReadMessageId: string;
    lastReadAt: string;
  },
) {
  const currentReadStates = patches[patch.conversationId] ?? [];
  const existing = currentReadStates.find(
    (readState) => readState.readerUserProfileId === patch.readerUserProfileId,
  );

  if (
    existing?.lastReadMessageId === patch.lastReadMessageId &&
    existing.lastReadAt === patch.lastReadAt
  ) {
    return patches;
  }

  return {
    ...patches,
    [patch.conversationId]: [
      ...currentReadStates.filter(
        (readState) =>
          readState.readerUserProfileId !== patch.readerUserProfileId,
      ),
      {
        readerUserProfileId: patch.readerUserProfileId,
        lastReadMessageId: patch.lastReadMessageId,
        lastReadAt: patch.lastReadAt,
      },
    ],
  };
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
