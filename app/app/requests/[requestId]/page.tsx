import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { getImporterVisibleQuotesForOwnedRequest } from "@/lib/quotes";
import {
  getShipmentRequestForCurrentImporter,
  requireImporterProfile,
} from "@/lib/shipment-requests";
import { acceptQuote, rejectQuote, startImporterConversation } from "./actions";

export const dynamic = "force-dynamic";

type RequestDetailPageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{
    decision?: string;
    decisionError?: string;
    messageError?: string;
  }>;
};

const requestIdSchema = z.string().uuid();

export default async function RequestDetailPage({
  params,
  searchParams,
}: RequestDetailPageProps) {
  const { requestId } = await params;
  const query = await searchParams;
  const parsedRequestId = requestIdSchema.safeParse(requestId);

  if (!parsedRequestId.success) {
    notFound();
  }

  const request = await getShipmentRequestForCurrentImporter(
    parsedRequestId.data,
  );

  if (!request) {
    notFound();
  }

  const { importerProfile } = await requireImporterProfile();
  const quotes = await getImporterVisibleQuotesForOwnedRequest(
    request.id,
    importerProfile.id,
  );

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Importer</p>
            <h1 className="text-3xl font-semibold">{request.cargoDescription}</h1>
          </div>
          <UserButton />
        </header>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/app/requests">Back to requests</Link>
          </Button>
        </div>

        <section className="mt-6 grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid gap-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="font-semibold uppercase">{request.status}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium text-muted-foreground">Route</p>
            <p>
              {request.origin} to {request.destination}
            </p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Cargo type
            </p>
            <p>{request.cargoType}</p>
          </div>
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
              value={request.deliveryPreference}
            />
            <DetailValue
              label="Shipping preference"
              value={request.shippingPreference}
            />
            <DetailValue label="Declared value" value={request.declaredValue} />
          </div>
          <DetailValue label="Notes" value={request.notes} />
          <DetailValue label="Attachment notes" value={request.attachmentNotes} />
        </section>

        <section className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Quotes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted quotes are visible only to you and the submitting
              forwarder.
            </p>
          </div>

          {query.decision ? (
            <div className="mt-4 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
              Quote {query.decision === "accept" ? "accepted" : "rejected"}.
            </div>
          ) : null}

          {query.decisionError ? (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {decisionErrorMessage(query.decisionError)}
            </div>
          ) : null}

          {query.messageError ? (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {messageErrorMessage(query.messageError)}
            </div>
          ) : null}

          {quotes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No quotes submitted yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  requestId={request.id}
                  requestStatus={request.status}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type ImporterVisibleQuote = Awaited<
  ReturnType<typeof getImporterVisibleQuotesForOwnedRequest>
>[number];

function QuoteCard({
  quote,
  requestId,
  requestStatus,
}: {
  quote: ImporterVisibleQuote;
  requestId: string;
  requestStatus: string;
}) {
  const isExpired = quote.status === "submitted" && quote.isExpired;
  const canAccept =
    quote.status === "submitted" &&
    requestStatus !== "quote_selected" &&
    !isExpired;
  const canReject = quote.status === "submitted";

  return (
    <article className="grid gap-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{quote.forwarderCompanyName}</h3>
        <div className="flex flex-wrap gap-2">
          {isExpired ? (
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs uppercase text-amber-900">
              expired
            </span>
          ) : null}
          <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
            {quote.status}
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailValue
          label="Amount"
          value={`${quote.currency} ${quote.quoteAmount}`}
        />
        <DetailValue
          label="Transit range"
          value={`${quote.estimatedTransitMinDays}-${quote.estimatedTransitMaxDays} days`}
        />
        <DetailValue label="Service offered" value={quote.serviceOffered} />
        <DetailValue
          label="Valid until"
          value={quote.validUntil.toLocaleDateString()}
        />
      </div>
      <DetailValue label="Inclusions" value={quote.inclusions} />
      <DetailValue label="Exclusions" value={quote.exclusions} />
      <DetailValue label="Notes" value={quote.notes} />

      <div className="pt-2">
        <form action={startImporterConversation}>
          <input type="hidden" name="requestId" value={requestId} />
          <input
            type="hidden"
            name="forwarderCompanyId"
            value={quote.forwarderCompanyId}
          />
          <Button type="submit" variant="outline">
            Message forwarder
          </Button>
        </form>
      </div>

      {canAccept || canReject ? (
        <div className="flex flex-wrap gap-3 pt-2">
          {canAccept ? (
            <form action={acceptQuote}>
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="quoteId" value={quote.id} />
              <Button type="submit">Accept quote</Button>
            </form>
          ) : null}
          {canReject ? (
            <form action={rejectQuote}>
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="quoteId" value={quote.id} />
              <Button type="submit" variant="outline">
                Reject quote
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function decisionErrorMessage(error: string) {
  switch (error) {
    case "not_found":
      return "That quote is not available for this request.";
    case "invalid_status":
      return "That quote can no longer be changed.";
    case "expired":
      return "Expired quotes cannot be accepted.";
    case "already_selected":
      return "This request already has an accepted quote.";
    default:
      return "The quote decision could not be saved.";
  }
}

function messageErrorMessage(error: string) {
  switch (error) {
    case "no_quote":
      return "Messaging opens only after this forwarder has submitted a quote.";
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
