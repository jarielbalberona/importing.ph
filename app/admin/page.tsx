import { UserButton } from "@clerk/nextjs";

import { getAdminOverview } from "@/lib/admin";
import {
  suspendForwarderCompany,
  unsuspendForwarderCompany,
} from "./actions";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string; safety?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const query = await searchParams;
  const overview = await getAdminOverview();

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Admin</p>
            <h1 className="text-3xl font-semibold">Control plane</h1>
          </div>
          <UserButton />
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <SummaryTile label="Users" value={overview.users.length} />
          <SummaryTile label="Requests" value={overview.requests.length} />
          <SummaryTile label="Quotes" value={overview.quotes.length} />
        </section>

        {query.safety ? (
          <div className="mt-6 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
            Forwarder company{" "}
            {query.safety === "suspended" ? "suspended" : "unsuspended"}.
          </div>
        ) : null}

        {query.error ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Admin action could not be saved.
          </div>
        ) : null}

        <AdminSection title="Users and profiles">
          {overview.users.length === 0 ? (
            <EmptyState>No users found.</EmptyState>
          ) : (
            <div className="grid divide-y">
              {overview.users.map((user) => (
                <article key={user.id} className="grid gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{user.fullName}</h3>
                    <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.importerCompanyName ||
                      user.forwarderCompanyName ||
                      "No business profile"}
                  </p>
                  {user.forwarderCompanyId ? (
                    <div className="mt-2 rounded-md border p-3">
                      <p className="text-sm font-medium">
                        Forwarder safety:{" "}
                        {user.forwarderCompanyIsSuspended
                          ? "suspended"
                          : "active"}
                      </p>
                      {user.forwarderCompanySuspendedReason ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {user.forwarderCompanySuspendedReason}
                        </p>
                      ) : null}
                      {user.forwarderCompanyIsSuspended ? (
                        <form
                          action={unsuspendForwarderCompany}
                          className="mt-3"
                        >
                          <input
                            type="hidden"
                            name="forwarderCompanyId"
                            value={user.forwarderCompanyId}
                          />
                          <button className="rounded-md border px-3 py-2 text-sm font-medium">
                            Unsuspend
                          </button>
                        </form>
                      ) : (
                        <form
                          action={suspendForwarderCompany}
                          className="mt-3 flex flex-wrap gap-2"
                        >
                          <input
                            type="hidden"
                            name="forwarderCompanyId"
                            value={user.forwarderCompanyId}
                          />
                          <input
                            name="reason"
                            required
                            maxLength={500}
                            placeholder="Suspension reason"
                            className="h-10 min-w-64 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                            Suspend
                          </button>
                        </form>
                      )}
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Clerk user: {user.clerkUserId}
                  </p>
                </article>
              ))}
            </div>
          )}
        </AdminSection>

        <AdminSection title="Shipment requests">
          {overview.requests.length === 0 ? (
            <EmptyState>No shipment requests found.</EmptyState>
          ) : (
            <div className="grid divide-y">
              {overview.requests.map((request) => (
                <article key={request.id} className="grid gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {request.cargoDescription}
                    </h3>
                    <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
                      {request.status}
                    </span>
                    <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                      {formatLabel(request.cargoType)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.origin} to {request.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Importer: {request.importerCompanyName} /{" "}
                    {request.importerUserName}
                  </p>
                </article>
              ))}
            </div>
          )}
        </AdminSection>

        <AdminSection title="Quotes">
          {overview.quotes.length === 0 ? (
            <EmptyState>No quotes found.</EmptyState>
          ) : (
            <div className="grid divide-y">
              {overview.quotes.map((quote) => (
                <article key={quote.id} className="grid gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {quote.forwarderCompanyName}
                    </h3>
                    <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
                      {quote.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quote.currency} {quote.amount} / {quote.serviceOffered}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Request: {quote.cargoDescription}
                  </p>
                </article>
              ))}
            </div>
          )}
        </AdminSection>
      </div>
    </main>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function AdminSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
