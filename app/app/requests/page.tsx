import Link from "next/link";

import { EmptyState, PageHeader } from "@/components/app-shell";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireRole } from "@/lib/authz";
import {
  formatCount,
  formatDate,
  formatDimensions,
  formatMeasure,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import { getShipmentRequestsForCurrentImporter } from "@/lib/shipment-requests";

export const dynamic = "force-dynamic";

export default async function ImporterRequestsPage() {
  await requireRole(["importer"]);
  const requests = await getShipmentRequestsForCurrentImporter();
  const totalQuotes = requests.reduce(
    (sum, request) => sum + request.quoteCount,
    0,
  );
  const activeRequests = requests.filter(
    (request) => request.status === "posted",
  ).length;
  const selectedRequests = requests.filter(
    (request) => request.status === "quote_selected",
  ).length;

  return (
    <>
      <PageHeader
        title="Shipment requests"
        description="Review posted shipment requests, compare private quotes, and continue conversations with forwarders."
        actions={
          <Button asChild size="lg">
            <Link href="/app/requests/new">New request</Link>
          </Button>
        }
      />

      <section className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-y py-4 text-sm">
        <RequestMetric label="Active" value={activeRequests} />
        <RequestMetric label="Quotes" value={totalQuotes} />
        <RequestMetric label="Selected" value={selectedRequests} />
      </section>

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
        <section className="mt-6 rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-80 w-[34%]">Request</TableHead>
                <TableHead className="min-w-[260px]">Route</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Quotes</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>
                  <span className="sr-only">Open</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const href = `/app/requests/${request.id}`;

                return (
                  <TableRow key={request.id} className="group cursor-pointer">
                    <TableCell className="min-w-80 whitespace-normal">
                      <Link href={href} className="block py-1">
                        <span className="font-medium">
                          {request.cargoDescription}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-2">
                          <RequestStatusBadge status={request.status} />
                          <span className="text-xs text-muted-foreground">
                            Posted {formatDate(request.createdAt)}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-[260px] whitespace-normal">
                      <Link href={href} className="block py-1">
                        <span className="block">
                          {formatStructuredRoute(request)}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {titleFromEnum(request.cargoType)} /{" "}
                          {titleFromEnum(request.deliveryPreference)}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={href} className="block py-1">
                        {sizeSummary(request)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={href} className="block py-1">
                        {formatDimensions(request)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={href} className="block py-1">
                        <Badge variant="outline">
                          {formatCount(request.quoteCount, "quote")}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={href} className="block py-1">
                        {formatDate(request.updatedAt)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={href}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}
    </>
  );
}

type ImporterRequest = Awaited<
  ReturnType<typeof getShipmentRequestsForCurrentImporter>
>[number];

function RequestMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}

function sizeSummary(request: ImporterRequest) {
  const values = [
    request.totalCbm ? formatMeasure(request.totalCbm, "CBM") : null,
    request.totalWeightKg ? formatMeasure(request.totalWeightKg, "kg") : null,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" / ") : "Not provided";
}
