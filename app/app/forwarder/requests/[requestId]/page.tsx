import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  DetailCard,
  DetailValue,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { QuoteSubmissionForm } from "@/components/forms/quote-submission-form";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { AttachmentList } from "@/components/requests/attachment-list";
import { Button } from "@/components/ui/button";
import {
  formatCount,
  formatDate,
  formatDeliveryPreference,
  formatDestination,
  formatDimensions,
  formatMeasure,
  formatMoney,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import {
  getShipmentRequestForForwarderDetail,
  requireForwarderMember,
} from "@/lib/forwarder-open-requests";
import {
  getForwarderOwnQuoteForRequest,
  getQuoteCountForRequest,
} from "@/lib/quotes";
import {
  defaultValidUntilFromDays,
  getForwarderQuoteDefaultsForCurrentCompany,
} from "@/lib/profile-settings";
import { listShipmentRequestAttachmentsForViewer } from "@/lib/media";
import { startForwarderConversation } from "./actions";

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

  const [quoteCount, ownQuote, quoteDefaults, attachments] = await Promise.all([
    getQuoteCountForRequest(request.id),
    getForwarderOwnQuoteForRequest(request.id, member.companyId),
    getForwarderQuoteDefaultsForCurrentCompany(member.companyId),
    listShipmentRequestAttachmentsForViewer(request.id),
  ]);

  return (
    <>
      <PageHeader
        title={request.cargoDescription}
        description={`${formatStructuredRoute(request)} / ${titleFromEnum(request.status)}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/app/forwarder/requests">Back to open requests</Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6">
        <DetailCard title="Shipment summary">
          <InfoGrid>
            <DetailValue label="Status" value={<RequestStatusBadge status={request.status} />} />
            <DetailValue label="Route" value={formatStructuredRoute(request)} />
            <DetailValue label="Cargo type" value={titleFromEnum(request.cargoType)} />
            <DetailValue label="Delivery preference" value={formatDeliveryPreference(request.deliveryPreference)} />
            <DetailValue label="Shipping preference" value={titleFromEnum(request.shippingPreference)} />
            <DetailValue label="Quotes sent" value={formatCount(quoteCount, "quote")} />
          </InfoGrid>
        </DetailCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <DetailCard title="Cargo details">
            <InfoGrid columns={2}>
              <DetailValue label="Cargo" value={request.cargoDescription} />
              <DetailValue label="Cargo type" value={titleFromEnum(request.cargoType)} />
            </InfoGrid>
          </DetailCard>

          <DetailCard title="Route and delivery">
            <InfoGrid columns={2}>
              <DetailValue label="Origin" value={request.origin} />
              <DetailValue label="Destination" value={formatDestination(request)} />
              <DetailValue
                label="Address details"
                value={request.destinationAddressDetails}
              />
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
            <DetailValue label="Declared value" value={request.declaredValue || "Not provided"} />
          </InfoGrid>
        </DetailCard>

        <DetailCard title="Preferences">
          <InfoGrid columns={2}>
            <DetailValue label="Delivery preference" value={formatDeliveryPreference(request.deliveryPreference)} />
            <DetailValue label="Shipping preference" value={titleFromEnum(request.shippingPreference)} />
          </InfoGrid>
        </DetailCard>

        <DetailCard title="Notes and supporting documents">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailValue label="Notes" value={request.notes} />
            <DetailValue label="Supporting document notes" value={request.attachmentNotes} />
          </div>
          <div className="mt-4">
            <AttachmentList files={attachments} />
          </div>
        </DetailCard>

        {ownQuote ? (
            <DetailCard
              title="Your quote"
              description="You already sent a quote for this request. Your quote is private. Other forwarders cannot see your price or service details."
            >
            <div className="mb-5 rounded-md border bg-muted p-4">
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="mt-1 break-words text-2xl font-semibold">
                {formatMoney(ownQuote.currency, ownQuote.quoteAmount)}
              </p>
            </div>
            <InfoGrid>
              <DetailValue label="Status" value={<StatusBadge>{titleFromEnum(ownQuote.status)}</StatusBadge>} />
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
                value={formatDate(ownQuote.validUntil)}
              />
            </InfoGrid>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailValue label="Inclusions" value={ownQuote.inclusions} />
              <DetailValue label="Exclusions" value={ownQuote.exclusions} />
              <DetailValue label="Notes" value={ownQuote.notes} />
            </div>
            <div className="mt-5 border-t pt-5">
              <form action={startForwarderConversation}>
                <input type="hidden" name="requestId" value={request.id} />
                <Button type="submit" variant="outline" className="w-full sm:w-auto">
                  Message importer
                </Button>
              </form>
            </div>
          </DetailCard>
        ) : null}

        {query.quote === "submitted" ? (
          <div className="mt-6 rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
            Your quote was sent.
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
          <QuoteSubmissionForm
            requestId={request.id}
            defaultValues={{
              currency: quoteDefaults?.currency ?? "PHP",
              serviceOffered: quoteDefaults?.serviceOffered ?? "",
              estimatedTransitMinDays:
                quoteDefaults?.transitMinDays?.toString() ?? "",
              estimatedTransitMaxDays:
                quoteDefaults?.transitMaxDays?.toString() ?? "",
              inclusions: quoteDefaults?.inclusions ?? "",
              exclusions: quoteDefaults?.exclusions ?? "",
              notes: quoteDefaults?.notes ?? "",
              validUntil:
                defaultValidUntilFromDays(quoteDefaults?.validForDays ?? null) ??
                "",
            }}
          />
        )}
      </div>
    </>
  );
}

function errorMessage(error: string) {
  switch (error) {
    case "duplicate":
      return "Your company already sent a quote for this request.";
    case "request_unavailable":
      return "This request is no longer available for quoting.";
    case "forwarder_suspended":
      return "Your company is suspended and cannot submit quotes.";
    case "validation":
      return "Complete the quote fields with a valid amount, transit range, and future validity date.";
    default:
      return "The quote was not sent. Try again.";
  }
}

function messageErrorMessage(error: string) {
  switch (error) {
    case "no_quote":
      return "Messages are available after your company sends a quote.";
    case "not_found":
      return "That conversation is not available.";
    default:
      return "Messages are not available right now.";
  }
}
