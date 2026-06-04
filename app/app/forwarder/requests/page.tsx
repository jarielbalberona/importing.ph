import Link from "next/link";

import {
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { SummaryCard } from "@/components/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  shippingPreferenceEnum,
} from "@/db/schema";
import {
  getOpenShipmentRequestsForForwarder,
  openRequestFiltersFromSearchParams,
} from "@/lib/forwarder-open-requests";
import {
  formatCount,
  formatDate,
  formatDimensions,
  formatMeasure,
  formatRoute,
  titleFromEnum,
} from "@/lib/format";

export const dynamic = "force-dynamic";

type ForwarderRequestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForwarderRequestsPage({
  searchParams,
}: ForwarderRequestsPageProps) {
  const rawSearchParams = await searchParams;
  const filters = openRequestFiltersFromSearchParams(rawSearchParams);
  const requests = await getOpenShipmentRequestsForForwarder(filters);
  const totalQuotes = requests.reduce(
    (sum, request) => sum + request.quoteCount,
    0,
  );
  const withQuotes = requests.filter((request) => request.quoteCount > 0).length;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Forwarder"
        title="Open shipment requests"
        description="Find importer requests that match your service lanes and send private quotes."
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Open requests" value={requests.length} />
        <SummaryCard label="With quotes" value={withQuotes} />
        <SummaryCard label="Quote activity" value={totalQuotes} />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filter requests</CardTitle>
          <CardDescription>
            Narrow the list by route, cargo, delivery, and handling needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium">
                Origin city or area
                <Input
                  name="origin"
                  defaultValue={filters.origin}
                  placeholder="Guangzhou, Yiwu, Shenzhen"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Philippine destination
                <Input
                  name="destination"
                  defaultValue={filters.destination}
                  placeholder="Manila, Cebu, Davao"
                />
              </label>
              <SelectFilter
                label="Cargo type"
                name="cargoType"
                value={filters.cargoType}
                options={cargoTypeEnum.enumValues}
              />
              <SelectFilter
                label="Delivery preference"
                name="deliveryPreference"
                value={filters.deliveryPreference}
                options={deliveryPreferenceEnum.enumValues}
              />
              <SelectFilter
                label="Shipping preference"
                name="shippingPreference"
                value={filters.shippingPreference}
                options={shippingPreferenceEnum.enumValues}
              />
              <label className="grid gap-2 text-sm font-medium">
                Special handling
                <Select
                  name="specialHandling"
                  defaultValue={filters.specialHandling ?? "__any"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any">Any</SelectItem>
                    <SelectItem value="msds">MSDS mentioned</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button type="submit" className="w-full sm:w-auto">
                Apply filters
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/app/forwarder/requests">Clear filters</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/app/forwarder/requests/${request.id}`}
            >
              <Card className="transition-colors hover:bg-accent">
                <CardContent>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 break-words text-lg font-semibold">
                        {request.cargoDescription}
                      </h2>
                      <StatusBadge>{titleFromEnum(request.status)}</StatusBadge>
                      <StatusBadge>
                        {titleFromEnum(request.cargoType)}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatRoute(request.origin, request.destination)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {titleFromEnum(request.deliveryPreference)} /{" "}
                      {titleFromEnum(request.shippingPreference)}
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
                          label="Posted"
                          value={formatDate(request.createdAt)}
                        />
                      </InfoGrid>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-3">
                  <Badge variant="outline">
                    {formatCount(request.quoteCount, "quote")}
                  </Badge>
                  <span className="text-sm font-medium text-primary">
                    View request
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}

type ForwarderRequest = Awaited<
  ReturnType<typeof getOpenShipmentRequestsForForwarder>
>[number];

function sizeSummary(request: ForwarderRequest) {
  const values = [
    request.totalCbm ? formatMeasure(request.totalCbm, "CBM") : null,
    request.totalWeightKg ? formatMeasure(request.totalWeightKg, "kg") : null,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" / ") : "Not provided";
}

function SelectFilter({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: readonly string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Select name={name} defaultValue={value ?? "__any"}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__any">Any</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {titleFromEnum(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
