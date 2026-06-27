import Link from "next/link";

import {
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
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
import {
  getOpenShipmentRequestsForForwarder,
  type OpenRequestFilters,
  openRequestFiltersFromSearchParams,
} from "@/lib/forwarder-open-requests";
import {
  formatCount,
  formatDate,
  formatDeliveryPreference,
  formatDimensions,
  formatMeasure,
  formatShippingModePreference,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import { getForwarderSettingsForCurrentUser } from "@/lib/profile-settings";
import { FilterSheet } from "./filter-sheet";

export const dynamic = "force-dynamic";

type ForwarderRequestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForwarderRequestsPage({
  searchParams,
}: ForwarderRequestsPageProps) {
  const rawSearchParams = await searchParams;
  const filters = openRequestFiltersFromSearchParams(rawSearchParams);
  const [requests, settings] = await Promise.all([
    getOpenShipmentRequestsForForwarder(filters),
    getForwarderSettingsForCurrentUser(),
  ]);
  const totalQuotes = requests.reduce(
    (sum, request) => sum + request.quoteCount,
    0,
  );
  const withQuotes = requests.filter((request) => request.quoteCount > 0).length;
  const ownQuotes = requests.filter((request) => request.ownQuoteStatus).length;
  const activeFilterCount = countActiveFilters(filters);
  const hasFilters = activeFilterCount > 0;
  const publicProfileFields = [
    settings.company.contactPerson,
    settings.company.contactEmail,
    settings.company.originCities,
    settings.company.destinationAreas,
    settings.company.shippingModes,
    settings.company.serviceDescription,
  ];
  const publicProfileComplete = publicProfileFields.every(
    (value) => Boolean(value?.trim()),
  );
  const quoteDefaultsComplete = Boolean(
    settings.quoteDefaults?.currency &&
      settings.quoteDefaults.serviceOffered &&
      settings.quoteDefaults.transitMinDays &&
      settings.quoteDefaults.transitMaxDays,
  );

  return (
    <>
      <PageHeader
        title="Open shipment requests"
        description="Find importer requests that match your service lanes and send private quotes."
        actions={
          <FilterSheet
            filters={filters}
            activeFilterCount={activeFilterCount}
          />
        }
      />

      <section className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-y py-4 text-sm">
        <RequestMetric label="Open requests" value={requests.length} />
        <RequestMetric label="With quotes" value={withQuotes} />
        <RequestMetric label="Quote activity" value={totalQuotes} />
      </section>

      <OnboardingChecklist
        title="Forwarder launch checklist"
        description="Complete the public profile and quote defaults before quoting live importer requests."
        items={[
          { label: "Company profile created", complete: true },
          {
            label: "Public profile complete",
            complete: publicProfileComplete,
          },
          {
            label: "Quote defaults configured",
            complete: quoteDefaultsComplete,
          },
          { label: "First quote sent", complete: ownQuotes > 0 },
        ]}
      />

      {requests.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No matching shipment requests"
            description={
              hasFilters
                ? "Try changing your filters or check again later."
                : "No importer has posted an open shipment request yet."
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
                <TableHead>Posted</TableHead>
                <TableHead>
                  <span className="sr-only">Open</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const href = `/app/forwarder/requests/${request.id}`;

                return (
                  <TableRow key={request.id} className="group cursor-pointer">
                    <TableCell className="min-w-80 whitespace-normal">
                      <Link href={href} className="block py-1">
                        <span className="font-medium">
                          {request.cargoDescription}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge>
                            {titleFromEnum(request.cargoType)}
                          </StatusBadge>
                          <OwnQuoteBadge status={request.ownQuoteStatus} />
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-[260px] whitespace-normal">
                      <Link href={href} className="block py-1">
                        <span className="block">
                          {formatStructuredRoute(request)}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {formatShippingModePreference(
                            request.shippingModePreference,
                          )}{" "}
                          /{" "}
                          {formatDeliveryPreference(request.deliveryPreference)}{" "}
                          / {titleFromEnum(request.shippingPreference)}
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
                        <QuoteCountBadge count={request.quoteCount} />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={href} className="block py-1">
                        {formatDate(request.createdAt)}
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

type ForwarderRequest = Awaited<
  ReturnType<typeof getOpenShipmentRequestsForForwarder>
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

function countActiveFilters(filters: OpenRequestFilters) {
  return [
    filters.origin,
    filters.destination,
    filters.cargoType,
    filters.deliveryPreference,
    filters.shippingModePreference,
    filters.shippingPreference,
    filters.specialHandling,
    filters.hideQuoted ? "hideQuoted" : undefined,
    filters.sort && filters.sort !== "newest" ? filters.sort : undefined,
  ].filter(Boolean).length;
}

function OwnQuoteBadge({ status }: { status: string | null }) {
  if (!status) {
    return null;
  }

  return (
    <Badge variant="secondary" className="border border-primary/20 text-primary">
      Quoted
    </Badge>
  );
}

function QuoteCountBadge({ count }: { count: number }) {
  return (
    <Badge variant="outline" className="border-primary/30 text-primary">
      {formatCount(count, "quote")}
    </Badge>
  );
}

function sizeSummary(request: ForwarderRequest) {
  const values = [
    request.totalCbm ? formatMeasure(request.totalCbm, "CBM") : null,
    request.totalWeightKg ? formatMeasure(request.totalWeightKg, "kg") : null,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" / ") : "Not provided";
}
