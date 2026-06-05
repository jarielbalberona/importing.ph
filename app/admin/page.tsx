import {
  AppShell,
  DetailCard,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatStructuredRoute, titleFromEnum } from "@/lib/format";
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
    <AppShell role="admin" badgeState={null}>
      <PageHeader
        title="Marketplace safety"
        description="Review current marketplace activity and pause forwarder companies when quoting needs to be stopped."
      />

      <section id="overview" className="mt-8 scroll-mt-24">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Marketplace overview</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            A simple snapshot of users, shipment requests, and quotes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile label="Users" value={overview.users.length} />
          <SummaryTile
            label="Shipment requests"
            value={overview.requests.length}
          />
          <SummaryTile label="Quotes" value={overview.quotes.length} />
        </div>
      </section>

      {query.safety ? (
        <div className="mt-6 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
          Forwarder company{" "}
          {query.safety === "suspended" ? "suspended" : "restored"}.
        </div>
      ) : null}

      {query.error ? (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Change was not saved. Try again.
        </div>
      ) : null}

        <AdminSection id="users" title="Users">
          {overview.users.length === 0 ? (
            <EmptyState title="No users found" description="New users will appear here after they create an account." />
          ) : (
            <div className="grid divide-y">
              {overview.users.map((user) => (
                <article key={user.id} className="grid gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{user.fullName}</h3>
                    <StatusBadge>{titleFromEnum(user.role)}</StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.importerCompanyName ||
                      user.forwarderCompanyName ||
                      "No company yet"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </AdminSection>

        <AdminSection id="requests" title="Shipment requests">
          {overview.requests.length === 0 ? (
            <EmptyState title="No shipment requests found" description="Shipment requests will appear here." />
          ) : (
            <div className="grid divide-y">
              {overview.requests.map((request) => (
                <article key={request.id} className="grid gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {request.cargoDescription}
                    </h3>
                    <RequestStatusBadge status={request.status} />
                    <StatusBadge>{titleFromEnum(request.cargoType)}</StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatStructuredRoute(request)}
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

        <AdminSection id="quotes" title="Quotes">
          {overview.quotes.length === 0 ? (
            <EmptyState title="No quotes found" description="Forwarder quotes will appear here." />
          ) : (
            <div className="grid divide-y">
              {overview.quotes.map((quote) => (
                <article key={quote.id} className="grid gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {quote.forwarderCompanyName}
                    </h3>
                    <StatusBadge>{titleFromEnum(quote.status)}</StatusBadge>
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
        <AdminSection
          id="forwarders"
          title="Forwarder companies"
          description="Company-level safety controls. This company cannot submit quotes while suspended."
        >
          {overview.forwarders.length === 0 ? (
            <EmptyState
              title="No forwarder companies found"
              description="Forwarder companies will appear here after providers set up their accounts."
            />
          ) : (
            <div className="grid gap-4">
              {overview.forwarders.map((forwarder) => (
                <article
                  key={forwarder.id}
                  className="grid min-w-0 gap-4 rounded-md border p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-semibold">
                        {forwarder.name}
                      </h3>
                      <ForwarderStatusBadge
                        isSuspended={forwarder.isSuspended}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {forwarder.isSuspended
                        ? "This company cannot submit quotes while suspended."
                        : "This company can submit quotes on open shipment requests."}
                    </p>
                    {forwarder.suspendedReason ? (
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Reason:</span>{" "}
                        {forwarder.suspendedReason}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Last updated {formatDateTime(forwarder.updatedAt)}
                    </p>
                  </div>
                  <div className="lg:min-w-80">
                    {forwarder.isSuspended ? (
                      <form action={unsuspendForwarderCompany}>
                        <input
                          type="hidden"
                          name="forwarderCompanyId"
                          value={forwarder.id}
                        />
                        <ConfirmSubmitButton
                          type="submit"
                          variant="outline"
                          className="w-full sm:w-auto"
                          message={`Restore ${forwarder.name}? This company will be able to submit quotes again.`}
                        >
                          Restore company
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      <form
                        action={suspendForwarderCompany}
                        className="grid gap-2"
                      >
                        <input
                          type="hidden"
                          name="forwarderCompanyId"
                          value={forwarder.id}
                        />
                        <label
                          className="text-sm font-medium"
                          htmlFor={`reason-${forwarder.id}`}
                        >
                          Safety note
                        </label>
                        <Input
                          id={`reason-${forwarder.id}`}
                          name="reason"
                          required
                          maxLength={500}
                          placeholder="Why quoting should be paused"
                        />
                        <ConfirmSubmitButton
                          type="submit"
                          className="w-full sm:w-auto"
                          message={`Suspend ${forwarder.name}? This company cannot submit quotes while suspended.`}
                        >
                          Suspend company
                        </ConfirmSubmitButton>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </AdminSection>
    </AppShell>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <DetailCard>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </DetailCard>
  );
}

function AdminSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <DetailCard
      title={title}
      description={description}
      className="mt-8 scroll-mt-24"
      id={id}
    >
      {children}
    </DetailCard>
  );
}

function ForwarderStatusBadge({ isSuspended }: { isSuspended: boolean }) {
  return (
    <span
      className={
        isSuspended
          ? "rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
          : "rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
      }
    >
      {isSuspended ? "Suspended" : "Active"}
    </span>
  );
}
