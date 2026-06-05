import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader, StatusBadge } from "@/components/app-shell";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { AttachmentList } from "@/components/requests/attachment-list";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { listShipmentRequestAttachmentsForViewer } from "@/lib/media";
import { startForwarderConversation } from "./actions";
import { RequestDetailToast } from "./request-detail-toast";

export const dynamic = "force-dynamic";

type ForwarderRequestDetailPageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ quote?: string; messageError?: string }>;
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

  const [quoteCount, ownQuote, attachments] = await Promise.all([
    getQuoteCountForRequest(request.id),
    getForwarderOwnQuoteForRequest(request.id, member.companyId),
    listShipmentRequestAttachmentsForViewer(request.id),
  ]);

  return (
    <>
      <PageHeader
        title={request.cargoDescription}
        description={`${formatStructuredRoute(request)} / ${titleFromEnum(request.status)}`}
        actions={
          <>
            {ownQuote ? (
              <form action={startForwarderConversation}>
                <input type="hidden" name="requestId" value={request.id} />
                <Button type="submit" variant="outline">
                  Message importer
                </Button>
              </form>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/app/forwarder/requests">Back to open requests</Link>
            </Button>
            {ownQuote ? null : (
              <Button asChild>
                <Link href={`/app/forwarder/requests/${request.id}/quote`}>
                  Send a quote
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="mt-6 grid gap-4">
        <RequestDetailToast
          quoteSubmitted={query.quote === "submitted"}
          messageError={
            query.messageError ? messageErrorMessage(query.messageError) : null
          }
        />

        <Tabs defaultValue="details" className="gap-6">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="details">Shipment details</TabsTrigger>
            <TabsTrigger value="quote">Your quote</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ShipmentDetails
              request={request}
              attachments={attachments}
              quoteCount={quoteCount}
            />
          </TabsContent>

          <TabsContent value="quote">
            <OwnQuotePanel ownQuote={ownQuote} requestId={request.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

type ForwarderRequest = NonNullable<
  Awaited<ReturnType<typeof getShipmentRequestForForwarderDetail>>
>;

type ForwarderOwnQuote = Awaited<
  ReturnType<typeof getForwarderOwnQuoteForRequest>
>;

function ShipmentDetails({
  request,
  attachments,
  quoteCount,
}: {
  request: ForwarderRequest;
  attachments: Awaited<ReturnType<typeof listShipmentRequestAttachmentsForViewer>>;
  quoteCount: number;
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
          <DefinitionItem
            label="Quotes sent"
            value={formatCount(quoteCount, "quote")}
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

      <DetailSection title="Route and delivery">
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

function OwnQuotePanel({
  ownQuote,
  requestId,
}: {
  ownQuote: ForwarderOwnQuote;
  requestId: string;
}) {
  if (!ownQuote) {
    return (
      <div className="rounded-md border border-dashed bg-background p-6 text-sm text-muted-foreground">
        No quote sent yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <DetailSection title="Quote summary">
        <div className="mb-5 rounded-md border bg-muted p-4">
          <p className="text-sm font-medium text-muted-foreground">Amount</p>
          <p className="mt-1 break-words text-2xl font-semibold">
            {formatMoney(ownQuote.currency, ownQuote.quoteAmount)}
          </p>
        </div>
        <DefinitionGrid>
          <DefinitionItem
            label="Status"
            value={<StatusBadge>{titleFromEnum(ownQuote.status)}</StatusBadge>}
          />
          <DefinitionItem
            label="Transit range"
            value={`${ownQuote.estimatedTransitMinDays}-${ownQuote.estimatedTransitMaxDays} days`}
          />
          <DefinitionItem
            label="Service offered"
            value={ownQuote.serviceOffered}
          />
          <DefinitionItem
            label="Valid until"
            value={formatDate(ownQuote.validUntil)}
          />
        </DefinitionGrid>
      </DetailSection>

      <DetailSection title="Scope">
        <DefinitionGrid>
          <DefinitionItem label="Inclusions" value={ownQuote.inclusions} />
          <DefinitionItem label="Exclusions" value={ownQuote.exclusions} />
          <DefinitionItem label="Notes" value={ownQuote.notes} />
        </DefinitionGrid>
      </DetailSection>

      <section className="border-t p-4 sm:p-5">
        <form action={startForwarderConversation}>
          <input type="hidden" name="requestId" value={requestId} />
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            Message importer
          </Button>
        </form>
      </section>
    </div>
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
