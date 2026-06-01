import Link from "next/link";

import {
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
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
        eyebrow="Account"
        title="Notifications"
        description="Quote updates, decisions, and messages will appear here."
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
              description="Quote updates, decisions, and messages will appear here."
            />
          </div>
        ) : (
          <section className="mt-8 grid gap-4">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={
                    notification.readAt
                      ? "grid gap-4 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:p-5"
                      : "grid gap-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:p-5"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words font-semibold">
                        {notification.title}
                      </h2>
                      <StatusBadge>
                        {notification.readAt ? "Read" : "Unread"}
                      </StatusBadge>
                    </div>
                    {notification.body ? (
                      <p className="mt-2 break-words text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <InfoGrid columns={2}>
                        <DetailValue
                          label="Type"
                          value={notificationTypeLabel(notification.type)}
                        />
                        <DetailValue
                          label={notification.readAt ? "Read" : "Received"}
                          value={formatDateTime(
                            notification.readAt ?? notification.createdAt,
                          )}
                        />
                      </InfoGrid>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start">
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <Link href={notification.linkHref}>
                        {actionLabel(notification.type)}
                      </Link>
                    </Button>
                    {notification.readAt ? null : (
                      <form action={markNotificationRead} className="w-full sm:w-auto">
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <Button type="submit" size="sm" className="w-full sm:w-auto">
                          Mark as read
                        </Button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
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

function actionLabel(type: Notification["type"]) {
  switch (type) {
    case "new_quote_received":
      return "View quote";
    case "quote_accepted":
    case "quote_rejected":
      return "View request";
    case "message_received":
      return "Open message";
    default:
      return "Open";
  }
}
