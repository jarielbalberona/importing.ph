import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader, StatusBadge } from "@/components/app-shell";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import {
  QuoteComparisonPanel,
  type QuoteComparisonItem,
} from "@/components/requests/quote-comparison-panel";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { AttachmentList } from "@/components/requests/attachment-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  formatDate,
  formatDeliveryPreference,
  formatDestination,
  formatDimensions,
  formatMeasure,
  formatMoney,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import { getImporterVisibleQuotesForOwnedRequest } from "@/lib/quotes";
import {
  getShipmentRequestForCurrentImporter,
  requireImporterProfile,
} from "@/lib/shipment-requests";
import { listShipmentRequestAttachmentsForViewer } from "@/lib/media";
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
  const [quotes, attachments] = await Promise.all([
    getImporterVisibleQuotesForOwnedRequest(request.id, importerProfile.id),
    listShipmentRequestAttachmentsForViewer(request.id),
  ]);
  const comparisonQuotes = quotes.map(toComparisonQuote);

  return (
    <>
      <PageHeader
        title={request.cargoDescription}
        description={`${formatStructuredRoute(request)} / ${titleFromEnum(request.status)}`}
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

      <div className="mt-6 grid gap-4">
        <RequestNotice query={query} />

        <Tabs defaultValue="details" className="gap-6">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="details">Shipment details</TabsTrigger>
            <TabsTrigger value="quotes">Received quotations</TabsTrigger>
            <TabsTrigger value="compare">Compare quotations</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ShipmentDetails request={request} attachments={attachments} />
          </TabsContent>

          <TabsContent value="quotes">
            <ReceivedQuotes
              quotes={quotes}
              requestId={request.id}
              requestStatus={request.status}
            />
          </TabsContent>

          <TabsContent value="compare">
            <QuoteComparisonPanel quotes={comparisonQuotes} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

type ShipmentRequest = NonNullable<
  Awaited<ReturnType<typeof getShipmentRequestForCurrentImporter>>
>;

type ImporterVisibleQuote = Awaited<
  ReturnType<typeof getImporterVisibleQuotesForOwnedRequest>
>[number];

function ShipmentDetails({
  request,
  attachments,
}: {
  request: ShipmentRequest;
  attachments: Awaited<ReturnType<typeof listShipmentRequestAttachmentsForViewer>>;
}) {
  return (
    <div className="rounded-md border bg-background">
      <DetailSection title="Summary">
        <DefinitionGrid>
          <DefinitionItem
            label="Status"
            value={<RequestStatusBadge status={request.status} />}
          />
          <DefinitionItem
            label="Route"
            value={formatStructuredRoute(request)}
          />
          <DefinitionItem
            label="Cargo type"
            value={titleFromEnum(request.cargoType)}
          />
          <DefinitionItem
            label="Delivery preference"
            value={formatDeliveryPreference(request.deliveryPreference)}
          />
          <DefinitionItem
            label="Shipping preference"
            value={titleFromEnum(request.shippingPreference)}
          />
        </DefinitionGrid>
      </DetailSection>

      <DetailSection title="Cargo">
        <DefinitionGrid>
          <DefinitionItem label="Cargo" value={request.cargoDescription} />
          <DefinitionItem
            label="Cargo type"
            value={titleFromEnum(request.cargoType)}
          />
          <DefinitionItem
            label="Total CBM"
            value={formatMeasure(request.totalCbm, "CBM")}
          />
          <DefinitionItem
            label="Total weight"
            value={formatMeasure(request.totalWeightKg, "kg")}
          />
          <DefinitionItem
            label="Package or carton count"
            value={request.packageCount?.toString() || "Not provided"}
          />
          <DefinitionItem
            label="Dimensions"
            value={formatDimensions(request)}
          />
          <DefinitionItem
            label="Declared value"
            value={request.declaredValue || "Not provided"}
          />
        </DefinitionGrid>
      </DetailSection>

      <DetailSection title="Pickup and destination">
        <DefinitionGrid>
          <DefinitionItem label="Origin" value={request.origin} />
          <DefinitionItem
            label="Destination"
            value={formatDestination(request)}
          />
          <DefinitionItem
            label="Address details"
            value={request.destinationAddressDetails}
          />
        </DefinitionGrid>
      </DetailSection>

      <DetailSection title="Notes and supporting documents">
        <DefinitionGrid>
          <DefinitionItem label="Notes" value={request.notes} />
          <DefinitionItem
            label="Supporting document notes"
            value={request.attachmentNotes}
          />
        </DefinitionGrid>
        <div className="mt-4">
          <AttachmentList files={attachments} />
        </div>
      </DetailSection>
    </div>
  );
}

function ReceivedQuotes({
  quotes,
  requestId,
  requestStatus,
}: {
  quotes: ImporterVisibleQuote[];
  requestId: string;
  requestStatus: string;
}) {
  if (quotes.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-background p-6 text-sm text-muted-foreground">
        No quotes yet. Forwarders can send quotes once they find this request.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Forwarder</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Transit</TableHead>
            <TableHead>Valid until</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <Dialog key={quote.id}>
              <DialogTrigger asChild>
                <TableRow
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="button"
                  tabIndex={0}
                >
                  <TableCell className="whitespace-normal">
                    <span className="font-medium">
                      {quote.forwarderCompanyName}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {quote.serviceOffered}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatMoney(quote.currency, quote.quoteAmount)}
                  </TableCell>
                  <TableCell>{transitRange(quote)}</TableCell>
                  <TableCell>{formatDate(quote.validUntil)}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-2">
                      {quote.status === "submitted" && quote.isExpired ? (
                        <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium uppercase text-amber-900">
                          Expired
                        </span>
                      ) : null}
                      <StatusBadge>{titleFromEnum(quote.status)}</StatusBadge>
                    </span>
                  </TableCell>
                </TableRow>
              </DialogTrigger>
              <QuoteDialog
                quote={quote}
                requestId={requestId}
                requestStatus={requestStatus}
              />
            </Dialog>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function QuoteDialog({
  quote,
  requestId,
  requestStatus,
}: {
  quote: ImporterVisibleQuote;
  requestId: string;
  requestStatus: string;
}) {
  return (
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{quote.forwarderCompanyName}</DialogTitle>
        <DialogDescription>
          {quote.serviceOffered} / {formatMoney(quote.currency, quote.quoteAmount)}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5">
        <DefinitionGrid>
          <DefinitionItem
            label="Amount"
            value={formatMoney(quote.currency, quote.quoteAmount)}
          />
          <DefinitionItem label="Transit range" value={transitRange(quote)} />
          <DefinitionItem
            label="Valid until"
            value={formatDate(quote.validUntil)}
          />
          <DefinitionItem
            label="Submitted"
            value={formatDate(quote.createdAt)}
          />
          <DefinitionItem
            label="Status"
            value={<StatusBadge>{titleFromEnum(quote.status)}</StatusBadge>}
          />
        </DefinitionGrid>

        <div className="grid gap-4 border-t pt-4 lg:grid-cols-3">
          <DefinitionItem label="Inclusions" value={quote.inclusions} />
          <DefinitionItem label="Exclusions" value={quote.exclusions} />
          <DefinitionItem label="Notes" value={quote.notes} />
        </div>
      </div>

      <DialogFooter>
        <QuoteActions
          quote={quote}
          requestId={requestId}
          requestStatus={requestStatus}
        />
      </DialogFooter>
    </DialogContent>
  );
}

function QuoteActions({
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
    <>
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
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-b p-4 last:border-b-0 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function DefinitionGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  );
}

function DefinitionItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm leading-6">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function RequestNotice({
  query,
}: {
  query: {
    decision?: string;
    decisionError?: string;
    messageError?: string;
  };
}) {
  if (query.decision) {
    return (
      <div className="rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
        Quote {query.decision === "accept" ? "accepted" : "declined"}.
      </div>
    );
  }

  if (query.decisionError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {decisionErrorMessage(query.decisionError)}
      </div>
    );
  }

  if (query.messageError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {messageErrorMessage(query.messageError)}
      </div>
    );
  }

  return null;
}

function toComparisonQuote(quote: ImporterVisibleQuote): QuoteComparisonItem {
  return {
    id: quote.id,
    companyName: quote.forwarderCompanyName,
    amount: formatMoney(quote.currency, quote.quoteAmount),
    status: titleFromEnum(quote.status),
    serviceOffered: quote.serviceOffered,
    transitRange: transitRange(quote),
    validUntil: formatDate(quote.validUntil),
    inclusions: quote.inclusions || "Not provided",
    exclusions: quote.exclusions || "Not provided",
    notes: quote.notes || "Not provided",
    submittedAt: formatDate(quote.createdAt),
    isExpired: quote.status === "submitted" && quote.isExpired,
  };
}

function transitRange(quote: ImporterVisibleQuote) {
  return `${quote.estimatedTransitMinDays}-${quote.estimatedTransitMaxDays} days`;
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
