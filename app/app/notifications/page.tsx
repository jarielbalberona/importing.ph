import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
  const notifications = await getNotificationsForCurrentUser();

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Workspace</p>
            <h1 className="text-3xl font-semibold">Notifications</h1>
          </div>
          <UserButton />
        </header>

        {query.error ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Notification could not be updated.
          </div>
        ) : null}

        {notifications.length === 0 ? (
          <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">No notifications</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Quote, decision, and message updates will appear here.
            </p>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="grid divide-y">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{notification.title}</h2>
                      <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
                        {notification.readAt ? "read" : "unread"}
                      </span>
                    </div>
                    {notification.body ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={notification.linkHref}>Open</Link>
                    </Button>
                    {notification.readAt ? null : (
                      <form action={markNotificationRead}>
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <Button type="submit" size="sm">
                          Mark read
                        </Button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
