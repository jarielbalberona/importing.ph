import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  DetailCard,
  DetailValue,
  EmptyState,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatDimensions,
  formatMeasure,
  formatMoney,
  formatRoute,
  titleFromEnum,
} from "@/lib/format";
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
    <>
      <PageHeader
        eyebrow="Importer"
        title={request.cargoDescription}
        description={`${formatRoute(request.origin, request.destination)} / ${titleFromEnum(request.status)}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/app/requests">Back to requests</Link>
            </Button>
            <Button asChild>
              <Link href="/app/requests/new">New request</Link>
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-6">
        <DetailCard title="Shipment summary">
          <InfoGrid>
            <DetailValue label="Status" value={<StatusBadge>{titleFromEnum(request.status)}</StatusBadge>} />
            <DetailValue label="Route" value={formatRoute(request.origin, request.destination)} />
            <DetailValue label="Cargo type" value={titleFromEnum(request.cargoType)} />
            <DetailValue label="Delivery preference" value={titleFromEnum(request.deliveryPreference)} />
            <DetailValue label="Shipping preference" value={titleFromEnum(request.shippingPreference)} />
          </InfoGrid>
        </DetailCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <DetailCard title="Cargo details">
            <InfoGrid columns={2}>
              <DetailValue label="Cargo" value={request.cargoDescription} />
              <DetailValue label="Cargo type" value={titleFromEnum(request.cargoType)} />
            </InfoGrid>
          </DetailCard>

          <DetailCard title="Pickup and destination">
            <InfoGrid columns={2}>
              <DetailValue label="Origin" value={request.origin} />
              <DetailValue label="Destination" value={request.destination} />
            </InfoGrid>
          </DetailCard>
        </div>

        <DetailCard title="Size and value">
          <InfoGrid>
            <DetailValue label="Total CBM" value={formatMeasure(request.totalCbm, "CBM")} />
            <DetailValue label="Total weight" value={formatMeasure(request.totalWeightKg, "kg")} />
            <DetailValue
              label="Package or carton count"
              value={request.packageCount?.toString() || "Not provided"}
            />
            <DetailValue label="Dimensions" value={formatDimensions(request)} />
            <DetailValue
              label="Declared value"
              value={request.declaredValue || "Not provided"}
            />
          </InfoGrid>
        </DetailCard>

        <DetailCard title="Shipping preferences">
          <InfoGrid columns={2}>
            <DetailValue label="Delivery preference" value={titleFromEnum(request.deliveryPreference)} />
            <DetailValue label="Shipping preference" value={titleFromEnum(request.shippingPreference)} />
          </InfoGrid>
        </DetailCard>

        <DetailCard title="Notes and supporting documents">
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailValue label="Notes" value={request.notes} />
            <DetailValue label="Supporting document notes" value={request.attachmentNotes} />
          </div>
        </DetailCard>

        <DetailCard
          title="Quote comparison"
          description="Only you and the forwarder who sent each quote can see the quote details."
        >

          {query.decision ? (
            <div className="mt-4 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
              Quote {query.decision === "accept" ? "accepted" : "declined"}.
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
            <EmptyState
              title="No quotes yet"
              description="Forwarders can send quotes once they find this request."
            />
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
        </DetailCard>
      </div>
    </>
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
    <article className="grid min-w-0 gap-5 rounded-md border bg-background p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold">
            {quote.forwarderCompanyName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {quote.serviceOffered}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isExpired ? (
          <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium uppercase text-amber-900">
              Expired
            </span>
          ) : null}
          <StatusBadge>{titleFromEnum(quote.status)}</StatusBadge>
        </div>
      </div>
      <div className="rounded-md border bg-muted p-4">
        <p className="text-sm font-medium text-muted-foreground">Amount</p>
        <p className="mt-1 text-2xl font-semibold">
          {formatMoney(quote.currency, quote.quoteAmount)}
        </p>
      </div>
      <InfoGrid>
        <DetailValue
          label="Forwarder"
          value={quote.forwarderCompanyName}
        />
        <DetailValue
          label="Transit range"
          value={`${quote.estimatedTransitMinDays}-${quote.estimatedTransitMaxDays} days`}
        />
        <DetailValue label="Service offered" value={quote.serviceOffered} />
        <DetailValue
          label="Valid until"
          value={formatDate(quote.validUntil)}
        />
      </InfoGrid>
      <div className="grid gap-4 lg:grid-cols-3">
        <DetailValue label="Inclusions" value={quote.inclusions} />
        <DetailValue label="Exclusions" value={quote.exclusions} />
        <DetailValue label="Notes" value={quote.notes} />
      </div>

      <div className="grid gap-3 border-t pt-4 sm:flex sm:flex-wrap">
        <form action={startImporterConversation} className="w-full sm:w-auto">
          <input type="hidden" name="requestId" value={requestId} />
          <input
            type="hidden"
            name="forwarderCompanyId"
            value={quote.forwarderCompanyId}
          />
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            Message forwarder
          </Button>
        </form>

      {canAccept || canReject ? (
        <>
          {canAccept ? (
            <form action={acceptQuote} className="w-full sm:w-auto">
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="quoteId" value={quote.id} />
              <ConfirmSubmitButton
                type="submit"
                className="w-full sm:w-auto"
                title="Accept this quote?"
                message="This will mark the quote as accepted for this shipment request. Other quotes will remain visible for your records."
                confirmLabel="Accept quote"
                cancelLabel="Cancel"
              >
                Accept quote
              </ConfirmSubmitButton>
            </form>
          ) : null}
          {canReject ? (
            <form action={rejectQuote} className="w-full sm:w-auto">
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="quoteId" value={quote.id} />
              <ConfirmSubmitButton
                type="submit"
                variant="outline"
                className="w-full sm:w-auto"
                title="Reject this quote?"
                message="This will mark the quote as rejected. You can still review the quote details later."
                confirmLabel="Reject quote"
                cancelLabel="Cancel"
              >
                Reject quote
              </ConfirmSubmitButton>
            </form>
          ) : null}
        </>
      ) : null}
      </div>
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
      return "The quote decision was not saved. Try again.";
  }
}

function messageErrorMessage(error: string) {
  switch (error) {
    case "no_quote":
      return "Messages are available after this forwarder sends a quote.";
    case "not_found":
      return "That conversation is not available.";
    default:
      return "Messages are not available right now.";
  }
}
