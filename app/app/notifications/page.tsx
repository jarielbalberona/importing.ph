import Link from "next/link";
import {
  CheckIcon,
  ExternalLinkIcon,
  FileSearchIcon,
  MessageSquareIcon,
} from "lucide-react";

import { EmptyState, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/authz";
import { formatDateTime, titleFromEnum } from "@/lib/format";
import { getNotificationsForCurrentUser } from "@/lib/notifications";
import { markNotificationRead } from "./actions";

export const dynamic = "force-dynamic";

type NotificationsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const query = await searchParams;
  await requireProfile();
  const notifications = await getNotificationsForCurrentUser();

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Quote updates, messages, and decisions appear here."
      />

      {query.error ? (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Notification was not updated. Try again.
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No notifications yet"
            description="Notifications will appear here when quotes, messages, or decisions are updated."
          />
        </div>
      ) : (
        <section className="mt-6 overflow-hidden rounded-md border bg-background">
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <article
                  className={
                    notification.readAt
                      ? "grid gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                      : "grid gap-3 border-l-2 border-l-primary bg-primary/5 px-4 py-4 transition-colors hover:bg-primary/10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={
                          notification.readAt
                            ? "break-words text-sm font-medium"
                            : "break-words text-sm font-semibold"
                        }
                      >
                        {notification.title}
                      </h2>
                      <Badge
                        variant={notification.readAt ? "outline" : "default"}
                      >
                        {notification.readAt ? "Read" : "Unread"}
                      </Badge>
                      <Badge variant="secondary">
                        {notificationTypeLabel(notification.type)}
                      </Badge>
                      <time
                        dateTime={notification.createdAt.toISOString()}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDateTime(notification.createdAt)}
                      </time>
                    </div>
                    {notification.body ? (
                      <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                        {notification.body}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 sm:justify-end">
                    <NotificationAction notification={notification} />
                    {notification.readAt ? null : (
                      <form action={markNotificationRead}>
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <CheckIcon />
                        </Button>
                      </form>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

type Notification = Awaited<
  ReturnType<typeof getNotificationsForCurrentUser>
>[number];

function notificationTypeLabel(type: Notification["type"]) {
  return titleFromEnum(type)
    .replace("New Quote Received", "New quote")
    .replace("Quote Accepted", "Quote accepted")
    .replace("Quote Rejected", "Quote declined")
    .replace("Message Received", "Message");
}

function NotificationAction({ notification }: { notification: Notification }) {
  const action = actionMeta(notification.type);
  const Icon = action.Icon;

  return (
    <Link
      href={notification.linkHref}
      aria-label={action.label}
      title={action.label}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{action.label}</span>
    </Link>
  );
}

function actionMeta(type: Notification["type"]) {
  switch (type) {
    case "new_quote_received":
      return { label: "View quote", Icon: FileSearchIcon };
    case "quote_accepted":
    case "quote_rejected":
      return { label: "View request", Icon: ExternalLinkIcon };
    case "message_received":
      return { label: "Open message", Icon: MessageSquareIcon };
    default:
      return { label: "Open", Icon: ExternalLinkIcon };
  }
}
