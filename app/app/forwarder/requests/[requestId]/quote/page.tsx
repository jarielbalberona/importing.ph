import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/app-shell";
import { QuoteSubmissionForm } from "@/components/forms/quote-submission-form";
import { QueryStateToast } from "@/components/query-state-toast";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Button } from "@/components/ui/button";
import {
  formatDeliveryPreference,
  formatStructuredRoute,
  titleFromEnum,
} from "@/lib/format";
import {
  getShipmentRequestForForwarderDetail,
  requireForwarderMember,
} from "@/lib/forwarder-open-requests";
import { getForwarderOwnQuoteForRequest } from "@/lib/quotes";
import {
  defaultValidUntilFromDays,
  getForwarderQuoteDefaultsForCurrentCompany,
} from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type ForwarderQuotePageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ error?: string }>;
};

const requestIdSchema = z.string().uuid();

export default async function ForwarderQuotePage({
  params,
  searchParams,
}: ForwarderQuotePageProps) {
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

  const [ownQuote, quoteDefaults] = await Promise.all([
    getForwarderOwnQuoteForRequest(request.id, member.companyId),
    getForwarderQuoteDefaultsForCurrentCompany(member.companyId),
  ]);

  if (ownQuote) {
    redirect(`/app/forwarder/requests/${request.id}`);
  }

  return (
    <>
      <PageHeader
        title="Send a quote"
        description={`${request.cargoDescription} / ${formatStructuredRoute(request)}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/app/forwarder/requests/${request.id}`}>
              Back to request
            </Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6">
        <QueryStateToast
          errorMessage={query.error ? errorMessage(query.error) : null}
          clearKeys={["error"]}
        />

        <section className="rounded-md border bg-background p-4 sm:p-5">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryItem
              label="Status"
              value={<RequestStatusBadge status={request.status} />}
            />
            <SummaryItem
              label="Cargo type"
              value={titleFromEnum(request.cargoType)}
            />
            <SummaryItem
              label="Delivery"
              value={formatDeliveryPreference(request.deliveryPreference)}
            />
            <SummaryItem
              label="Shipping preference"
              value={titleFromEnum(request.shippingPreference)}
            />
          </div>
        </section>

        <QuoteSubmissionForm
          requestId={request.id}
          cancelHref={`/app/forwarder/requests/${request.id}`}
          defaultValues={{
            currency: quoteDefaults?.currency ?? "PHP",
            serviceOffered:
              formatDeliveryPreference(request.deliveryPreference) !==
              "Not provided"
                ? formatDeliveryPreference(request.deliveryPreference)
                : (quoteDefaults?.serviceOffered ?? ""),
            estimatedTransitMinDays:
              quoteDefaults?.transitMinDays?.toString() ?? "",
            estimatedTransitMaxDays:
              quoteDefaults?.transitMaxDays?.toString() ?? "",
            inclusions: quoteDefaults?.inclusions ?? "",
            exclusions: quoteDefaults?.exclusions ?? "",
            notes: quoteDefaults?.notes ?? "",
            validUntil:
              defaultValidUntilFromDays(quoteDefaults?.validForDays ?? 14) ??
              "",
          }}
        />
      </div>
    </>
  );
}

function SummaryItem({
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
