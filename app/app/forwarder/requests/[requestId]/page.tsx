import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getShipmentRequestForForwarderDetail,
  requireForwarderMember,
} from "@/lib/forwarder-open-requests";
import {
  getForwarderOwnQuoteForRequest,
  getQuoteCountForRequest,
} from "@/lib/quotes";
import { startForwarderConversation, submitQuote } from "./actions";

export const dynamic = "force-dynamic";

type ForwarderRequestDetailPageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ error?: string; quote?: string; messageError?: string }>;
};

const requestIdSchema = z.string().uuid();

export default async function ForwarderRequestDetailPage({
  params,
  searchParams,
}: ForwarderRequestDetailPageProps) {
  const { requestId } = await params;
  const query = await searchParams;
  const parsedRequestId = requestIdSchema.safeParse(requestId);

  if (!parsedRequestId.success) {
    notFound();
  }

  const { member } = await requireForwarderMember();
  const request = await getShipmentRequestForForwarderDetail(
    parsedRequestId.data,
    member.companyId,
  );

  if (!request) {
    notFound();
  }

  const [quoteCount, ownQuote] = await Promise.all([
    getQuoteCountForRequest(request.id),
    getForwarderOwnQuoteForRequest(request.id, member.companyId),
  ]);

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Forwarder</p>
            <h1 className="text-3xl font-semibold">{request.cargoDescription}</h1>
          </div>
          <UserButton />
        </header>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/app/forwarder/requests">Back to open requests</Link>
          </Button>
        </div>

        <section className="mt-6 grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
          <DetailValue label="Status" value={request.status.toUpperCase()} />
          <DetailValue
            label="Route"
            value={`${request.origin} to ${request.destination}`}
          />
          <DetailValue label="Cargo type" value={formatLabel(request.cargoType)} />
          <div className="grid gap-3 sm:grid-cols-3">
            <DetailValue label="Total CBM" value={request.totalCbm} />
            <DetailValue label="Total weight kg" value={request.totalWeightKg} />
            <DetailValue
              label="Package count"
              value={request.packageCount?.toString()}
            />
            <DetailValue label="Length cm" value={request.lengthCm} />
            <DetailValue label="Width cm" value={request.widthCm} />
            <DetailValue label="Height cm" value={request.heightCm} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailValue
              label="Delivery preference"
              value={formatLabel(request.deliveryPreference)}
            />
            <DetailValue
              label="Shipping preference"
              value={formatLabel(request.shippingPreference)}
            />
            <DetailValue label="Declared value" value={request.declaredValue} />
          </div>
          <DetailValue label="Notes" value={request.notes} />
          <DetailValue label="Attachment notes" value={request.attachmentNotes} />
          <DetailValue label="Quote count" value={quoteCount.toString()} />
        </section>

        {ownQuote ? (
          <section className="mt-6 grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">Your quote</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Only your company and the importer owner can see these details.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailValue label="Status" value={ownQuote.status} />
              <DetailValue
                label="Amount"
                value={`${ownQuote.currency} ${ownQuote.quoteAmount}`}
              />
              <DetailValue
                label="Transit range"
                value={`${ownQuote.estimatedTransitMinDays}-${ownQuote.estimatedTransitMaxDays} days`}
              />
              <DetailValue
                label="Service offered"
                value={ownQuote.serviceOffered}
              />
              <DetailValue
                label="Valid until"
                value={ownQuote.validUntil.toLocaleDateString()}
              />
            </div>
            <DetailValue label="Inclusions" value={ownQuote.inclusions} />
            <DetailValue label="Exclusions" value={ownQuote.exclusions} />
            <DetailValue label="Notes" value={ownQuote.notes} />
            <form action={startForwarderConversation}>
              <input type="hidden" name="requestId" value={request.id} />
              <Button type="submit" variant="outline">
                Message importer
              </Button>
            </form>
          </section>
        ) : null}

        {query.quote === "submitted" ? (
          <div className="mt-6 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
            Quote submitted.
          </div>
        ) : null}

        {query.error ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage(query.error)}
          </div>
        ) : null}

        {query.messageError ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {messageErrorMessage(query.messageError)}
          </div>
        ) : null}

        {ownQuote ? null : (
        <form action={submitQuote} className="mt-6 grid gap-5 rounded-lg border bg-card p-6 shadow-sm">
          <input type="hidden" name="requestId" value={request.id} />
          <div>
            <h2 className="text-lg font-semibold">Submit quote</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One submitted quote per forwarder company is allowed for this
              request.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="quoteAmount">Amount</Label>
              <Input
                id="quoteAmount"
                name="quoteAmount"
                required
                inputMode="decimal"
                placeholder="25000.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="PHP" required />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="serviceOffered">Service offered</Label>
              <Input
                id="serviceOffered"
                name="serviceOffered"
                required
                placeholder="China to Philippines door-to-door consolidation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedTransitMinDays">
                Minimum transit days
              </Label>
              <Input
                id="estimatedTransitMinDays"
                name="estimatedTransitMinDays"
                required
                inputMode="numeric"
                placeholder="12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedTransitMaxDays">
                Maximum transit days
              </Label>
              <Input
                id="estimatedTransitMaxDays"
                name="estimatedTransitMaxDays"
                required
                inputMode="numeric"
                placeholder="18"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validUntil">Valid until</Label>
              <Input id="validUntil" name="validUntil" type="date" required />
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Inclusions
            <textarea
              name="inclusions"
              required
              rows={3}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Exclusions
            <textarea
              name="exclusions"
              required
              rows={3}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Notes
            <textarea
              name="notes"
              rows={3}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div>
            <Button type="submit">Submit quote</Button>
          </div>
        </form>
        )}
      </div>
    </main>
  );
}

function errorMessage(error: string) {
  switch (error) {
    case "duplicate":
      return "Your company already submitted a quote for this request.";
    case "request_unavailable":
      return "This request is no longer available for quoting.";
    case "forwarder_suspended":
      return "Your company is suspended and cannot submit quotes.";
    case "validation":
      return "Complete the quote fields with a valid amount, transit range, and future validity date.";
    default:
      return "The quote could not be submitted.";
  }
}

function messageErrorMessage(error: string) {
  switch (error) {
    case "no_quote":
      return "Messaging opens only after your company has submitted a quote.";
    case "not_found":
      return "That conversation is not available.";
    default:
      return "Messaging could not be opened.";
  }
}

function DetailValue({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p>{value || "Not provided"}</p>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
