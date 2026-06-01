import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireImporterProfile } from "@/lib/shipment-requests";
import { createShipmentRequest } from "./actions";

export const dynamic = "force-dynamic";

type NewShipmentRequestPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewShipmentRequestPage({
  searchParams,
}: NewShipmentRequestPageProps) {
  await requireImporterProfile();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Importer</p>
            <h1 className="text-3xl font-semibold">New shipment request</h1>
          </div>
          <UserButton />
        </header>

        {params.error === "validation" ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Complete the required fields and provide total CBM, total weight, or
            dimensions plus package count.
          </div>
        ) : null}

        <form action={createShipmentRequest} className="mt-8 grid gap-6">
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold">
              What are you shipping?
            </h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cargoDescription">Cargo description</Label>
                <Input
                  id="cargoDescription"
                  name="cargoDescription"
                  required
                  minLength={3}
                  maxLength={240}
                  placeholder="Example: 20 cartons of phone accessories"
                />
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Cargo type
                <select
                  name="cargoType"
                  required
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="general_goods"
                >
                  <option value="general_goods">General goods</option>
                  <option value="electronics">Electronics</option>
                  <option value="apparel">Apparel</option>
                  <option value="machinery">Machinery</option>
                  <option value="furniture">Furniture</option>
                  <option value="food_or_beverage">Food or beverage</option>
                  <option value="cosmetics">Cosmetics</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">Step 2</p>
            <h2 className="mt-1 text-lg font-semibold">
              Size, weight, and value
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="totalCbm">Total CBM</Label>
                <Input id="totalCbm" name="totalCbm" inputMode="decimal" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalWeightKg">Total weight kg</Label>
                <Input
                  id="totalWeightKg"
                  name="totalWeightKg"
                  inputMode="decimal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="packageCount">Package count</Label>
                <Input id="packageCount" name="packageCount" inputMode="numeric" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="declaredValue">Declared value</Label>
                <Input
                  id="declaredValue"
                  name="declaredValue"
                  inputMode="decimal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lengthCm">Length cm</Label>
                <Input id="lengthCm" name="lengthCm" inputMode="decimal" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="widthCm">Width cm</Label>
                <Input id="widthCm" name="widthCm" inputMode="decimal" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heightCm">Height cm</Label>
                <Input id="heightCm" name="heightCm" inputMode="decimal" />
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">Step 3</p>
            <h2 className="mt-1 text-lg font-semibold">
              Pickup and destination
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  name="origin"
                  required
                  placeholder="Example: Guangzhou, China"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  name="destination"
                  required
                  placeholder="Example: Manila, Philippines"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">Step 4</p>
            <h2 className="mt-1 text-lg font-semibold">Shipping preference</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Delivery preference
                <select
                  name="deliveryPreference"
                  required
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="door_to_door"
                >
                  <option value="door_to_door">Door to door</option>
                  <option value="port_to_door">Port to door</option>
                  <option value="door_to_port">Door to port</option>
                  <option value="port_to_port">Port to port</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Shipping preference
                <select
                  name="shippingPreference"
                  required
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="balanced"
                >
                  <option value="lowest_cost">Lowest cost</option>
                  <option value="fastest">Fastest</option>
                  <option value="balanced">Balanced</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">Step 5</p>
            <h2 className="mt-1 text-lg font-semibold">Attachments and notes</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Notes
                <textarea
                  name="notes"
                  rows={4}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Attachment notes
                <textarea
                  name="attachmentNotes"
                  rows={3}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="List commercial invoice, packing list, photos, or MSDS availability. Real file upload is not part of V1."
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">Step 6</p>
            <h2 className="mt-1 text-lg font-semibold">Review and post</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This posts the request immediately. Draft editing is schema-ready
              but not part of this first creation pass.
            </p>
            <div className="mt-5">
              <Button type="submit" size="lg">
                Post request
              </Button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
