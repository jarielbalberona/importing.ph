import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  shippingPreferenceEnum,
} from "@/db/schema";
import {
  getOpenShipmentRequestsForForwarder,
  openRequestFiltersFromSearchParams,
} from "@/lib/forwarder-open-requests";

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

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Forwarder</p>
            <h1 className="text-3xl font-semibold">Open requests</h1>
          </div>
          <UserButton />
        </header>

        <form className="mt-8 grid gap-4 rounded-lg border bg-card p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Origin
              <Input
                name="origin"
                defaultValue={filters.origin}
                placeholder="Guangzhou, Yiwu, Shenzhen"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Destination
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
              <select
                name="specialHandling"
                defaultValue={filters.specialHandling ?? ""}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any</option>
                <option value="msds">MSDS mentioned</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Apply filters</Button>
            <Button asChild variant="outline">
              <Link href="/app/forwarder/requests">Clear</Link>
            </Button>
          </div>
        </form>

        {requests.length === 0 ? (
          <section className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">No open requests found</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Posted importer requests will appear here when they match the
              current filters.
            </p>
          </section>
        ) : (
          <section className="mt-6 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="grid divide-y">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/app/forwarder/requests/${request.id}`}
                  className="grid gap-3 p-5 transition-colors hover:bg-muted/60 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">
                        {request.cargoDescription}
                      </h2>
                      <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
                        {request.status}
                      </span>
                      <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        {formatLabel(request.cargoType)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {request.origin} to {request.destination}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatLabel(request.deliveryPreference)} /{" "}
                      {formatLabel(request.shippingPreference)}
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
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
