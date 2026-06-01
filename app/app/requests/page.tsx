import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { requireRole } from "@/lib/authz";
import { Button } from "@/components/ui/button";
import { getShipmentRequestsForCurrentImporter } from "@/lib/shipment-requests";

export const dynamic = "force-dynamic";

export default async function ImporterRequestsPage() {
  await requireRole(["importer"]);
  const requests = await getShipmentRequestsForCurrentImporter();

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Importer</p>
            <h1 className="text-3xl font-semibold">Requests</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/app/notifications">Notifications</Link>
            </Button>
            <Button asChild>
              <Link href="/app/requests/new">New request</Link>
            </Button>
            <UserButton />
          </div>
        </header>

        {requests.length === 0 ? (
          <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">No requests yet</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Create the first quoteable shipment request before inviting
              forwarder activity.
            </p>
            <Button asChild className="mt-5">
              <Link href="/app/requests/new">Create request</Link>
            </Button>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="grid gap-0 divide-y">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/app/requests/${request.id}`}
                  className="grid gap-3 p-5 transition-colors hover:bg-muted/60 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">
                        {request.cargoDescription}
                      </h2>
                      <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {request.origin} to {request.destination}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {request.totalCbm ? `${request.totalCbm} CBM` : null}
                    {request.totalCbm && request.totalWeightKg ? " / " : null}
                    {request.totalWeightKg
                      ? `${request.totalWeightKg} kg`
                      : null}
                    {!request.totalCbm && !request.totalWeightKg
                      ? "Dimensions provided"
                      : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
