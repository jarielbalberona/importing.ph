import Link from "next/link";

import {
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  formatCount,
  formatDate,
  formatDimensions,
  formatMeasure,
  formatRoute,
  titleFromEnum,
} from "@/lib/format";
import { requireRole } from "@/lib/authz";
import { getShipmentRequestsForCurrentImporter } from "@/lib/shipment-requests";

export const dynamic = "force-dynamic";

export default async function ImporterRequestsPage() {
  await requireRole(["importer"]);
  const requests = await getShipmentRequestsForCurrentImporter();

  return (
    <>
      <PageHeader
        eyebrow="Importer"
        title="Shipment requests"
        description="Review your posted shipment requests, compare private quotes, and continue conversations with forwarders."
        actions={
          <Button asChild size="lg">
            <Link href="/app/requests/new">New request</Link>
          </Button>
        }
      />

        {requests.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No shipment requests yet"
              description="Create your first request so forwarders can send quotes."
              action={
                <Button asChild>
              <Link href="/app/requests/new">Create request</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <section className="mt-8 grid gap-4">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/app/requests/${request.id}`}
                  className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/60 sm:p-5"
                >
                  <article className="grid gap-5 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 break-words text-lg font-semibold">
                        {request.cargoDescription}
                      </h2>
                      <StatusBadge>{titleFromEnum(request.status)}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatRoute(request.origin, request.destination)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {titleFromEnum(request.cargoType)} /{" "}
                      {titleFromEnum(request.deliveryPreference)}
                    </p>
                    <div className="mt-4">
                      <InfoGrid>
                        <DetailValue
                          label="Size and weight"
                          value={sizeSummary(request)}
                        />
                        <DetailValue
                          label="Dimensions"
                          value={formatDimensions(request)}
                        />
                        <DetailValue
                          label="Last updated"
                          value={formatDate(request.updatedAt)}
                        />
                      </InfoGrid>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span className="rounded-md border bg-background px-3 py-2 text-sm font-medium">
                      {formatCount(request.quoteCount, "quote")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Posted {formatDate(request.createdAt)}
                    </span>
                    <span className="text-sm font-medium text-cyan-800">
                      View details
                    </span>
                  </div>
                  </article>
                </Link>
              ))}
          </section>
        )}
    </>
  );
}

type ImporterRequest = Awaited<
  ReturnType<typeof getShipmentRequestsForCurrentImporter>
>[number];

function sizeSummary(request: ImporterRequest) {
  const values = [
    request.totalCbm ? formatMeasure(request.totalCbm, "CBM") : null,
    request.totalWeightKg ? formatMeasure(request.totalWeightKg, "kg") : null,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" / ") : "Not provided";
}
