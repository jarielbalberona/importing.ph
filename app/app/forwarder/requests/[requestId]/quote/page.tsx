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
  formatShippingModePreference,
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
import { updateQuote } from "../actions";
import {
  canEditForwarderCompanySettings,
  getForwarderCompanyPublicProfileCompleteness,
} from "@/lib/forwarder-company-profile";
import { FunnelEntryEvent } from "@/components/funnel-entry-event";

export const dynamic = "force-dynamic";

type ForwarderQuotePageProps = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ error?: string; mode?: string }>;
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

  const isEditing = query.mode === "edit";
  const readiness = getForwarderCompanyPublicProfileCompleteness({
    name: member.companyName,
    slug: member.companySlug,
    shippingModes: member.companyShippingModes,
    originCities: member.companyOriginCities,
    destinationAreas: member.companyDestinationAreas,
    serviceDescription: member.companyServiceDescription,
  });
  const canCompleteProfile = canEditForwarderCompanySettings(member.memberRole);

  if (isEditing && !ownQuote) {
    redirect(`/app/forwarder/requests/${request.id}`);
  }

  if (
    ownQuote &&
    (!isEditing || ownQuote.status !== "submitted" || request.status !== "posted")
  ) {
    redirect(`/app/forwarder/requests/${request.id}`);
  }

  return (
    <>
      {!isEditing ? (
        <FunnelEntryEvent
          eventName="quote_started"
          role="forwarder"
          entityType="shipment_request"
          entityId={request.id}
        />
      ) : null}
      <PageHeader
        title={isEditing ? "Edit quote" : "Send a quote"}
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
              label="Shipping mode"
              value={formatShippingModePreference(
                request.shippingModePreference,
              )}
            />
            <SummaryItem
              label="Shipping preference"
              value={titleFromEnum(request.shippingPreference)}
            />
          </div>
        </section>

        {!isEditing && !readiness.isComplete ? (
          <section className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <h2 className="font-semibold">Complete the company profile before quoting</h2>
            <p className="mt-2 text-sm leading-6">
              Missing: {readiness.missingFields.join(", ")}.
              {canCompleteProfile
                ? " Add these public details, then return to submit the quote."
                : " Contact a company owner or admin to add these public details."}
            </p>
            {canCompleteProfile ? (
              <Button asChild className="mt-4">
                <Link href="/app/forwarder/company/edit">Complete company profile</Link>
              </Button>
            ) : null}
          </section>
        ) : (
        <QuoteSubmissionForm
          requestId={request.id}
          quoteId={ownQuote?.id}
          requestShippingModePreference={request.shippingModePreference}
          cancelHref={`/app/forwarder/requests/${request.id}`}
          action={isEditing ? updateQuote : undefined}
          submitLabel={isEditing ? "Save quote changes" : "Submit quote"}
          pendingLabel={isEditing ? "Saving..." : "Submitting..."}
          defaultValues={{
            quoteAmount: ownQuote?.quoteAmount ?? undefined,
            currency: ownQuote?.currency ?? quoteDefaults?.currency ?? "PHP",
            shippingMode:
              ownQuote?.shippingMode ??
              (request.shippingModePreference === "either"
                ? undefined
                : request.shippingModePreference),
            serviceOffered:
              ownQuote?.serviceOffered ??
              (formatDeliveryPreference(request.deliveryPreference) !==
                "Not provided"
                ? formatDeliveryPreference(request.deliveryPreference)
                : (quoteDefaults?.serviceOffered ?? "")),
            estimatedTransitMinDays:
              ownQuote?.estimatedTransitMinDays?.toString() ??
              quoteDefaults?.transitMinDays?.toString() ??
              "",
            estimatedTransitMaxDays:
              ownQuote?.estimatedTransitMaxDays?.toString() ??
              quoteDefaults?.transitMaxDays?.toString() ??
              "",
            inclusions: ownQuote?.inclusions ?? quoteDefaults?.inclusions ?? "",
            exclusions: ownQuote?.exclusions ?? quoteDefaults?.exclusions ?? "",
            notes: ownQuote?.notes ?? quoteDefaults?.notes ?? "",
            validUntil:
              ownQuote?.validUntil.toISOString().slice(0, 10) ??
              defaultValidUntilFromDays(quoteDefaults?.validForDays ?? 14) ??
              "",
          }}
        />
        )}
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
    case "profile_incomplete":
      return "Complete your company profile before submitting a new quote.";
    case "invalid_status":
      return "This quote can no longer be edited.";
    case "validation":
      return "Complete the quote fields with a valid shipping mode, amount, transit range, and future validity date.";
    case "rate_limited":
      return "Too many quote changes. Wait a few minutes and try again.";
    default:
      return "The quote was not sent. Try again.";
  }
}
