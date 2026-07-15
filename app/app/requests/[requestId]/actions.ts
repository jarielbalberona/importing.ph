"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  acceptQuoteForCurrentImporter,
  QuoteDecisionError,
  rejectQuoteForCurrentImporter,
} from "@/lib/quotes";
import { publishShipmentRequestForCurrentImporter } from "@/lib/shipment-requests";
import {
  getOrCreateConversationForCurrentImporter,
  MessagingAccessError,
} from "@/lib/messages";
import { RateLimitError } from "@/lib/rate-limit";
import {
  disableRequestSharingForCurrentImporter,
  enableRequestSharingForCurrentImporter,
  RequestShareError,
  rotateRequestShareLinkForCurrentImporter,
} from "@/lib/request-sharing";
import {
  findJourneyForEntity,
  recordFunnelEvent,
  recordRequestFunnelEvent,
} from "@/lib/funnel-events";
import { runBestEffort } from "@/lib/best-effort";

const idSchema = z.string().uuid();

export async function acceptQuote(formData: FormData) {
  await decideQuote(formData, "accept");
}

export async function rejectQuote(formData: FormData) {
  await decideQuote(formData, "reject");
}

export async function publishDraftRequest(formData: FormData) {
  const requestId = idSchema.safeParse(formData.get("requestId"));

  if (!requestId.success) {
    redirect("/app/requests?error=invalid-request");
  }

  let request: Awaited<
    ReturnType<typeof publishShipmentRequestForCurrentImporter>
  >;
  try {
    request = await publishShipmentRequestForCurrentImporter(requestId.data);
    if (request) {
      await runBestEffort(
        "funnel.request_posted_failed",
        () =>
          recordRequestFunnelEvent({
            eventName: "request_posted",
            role: "importer",
            entityType: "shipment_request",
            entityId: request.id,
          }),
        { requestId: request.id },
      );
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      redirect(`/app/requests/${requestId.data}?requestError=rate_limited`);
    }
    throw error;
  }

  redirect(
    request
      ? `/app/requests/${requestId.data}?request=posted`
      : `/app/requests/${requestId.data}?requestError=publish-unavailable`,
  );
}

export async function saveRequestShare(formData: FormData) {
  const requestId = idSchema.safeParse(formData.get("requestId"));

  if (!requestId.success) {
    redirect("/app/requests?error=invalid-request");
  }

  try {
    await enableRequestSharingForCurrentImporter({
      requestId: requestId.data,
      publicSummary: formData.get("publicSummary"),
    });
  } catch (error) {
    redirectToShareError(requestId.data, error);
  }

  redirect(`/app/requests/${requestId.data}?share=saved`);
}

export async function rotateRequestShare(formData: FormData) {
  const requestId = idSchema.safeParse(formData.get("requestId"));

  if (!requestId.success) {
    redirect("/app/requests?error=invalid-request");
  }

  try {
    await rotateRequestShareLinkForCurrentImporter(requestId.data);
  } catch (error) {
    redirectToShareError(requestId.data, error);
  }

  redirect(`/app/requests/${requestId.data}?share=rotated`);
}

export async function disableRequestShare(formData: FormData) {
  const requestId = idSchema.safeParse(formData.get("requestId"));

  if (!requestId.success) {
    redirect("/app/requests?error=invalid-request");
  }

  try {
    await disableRequestSharingForCurrentImporter(requestId.data);
  } catch (error) {
    redirectToShareError(requestId.data, error);
  }

  redirect(`/app/requests/${requestId.data}?share=disabled`);
}

export async function startImporterConversation(formData: FormData) {
  const requestId = idSchema.safeParse(formData.get("requestId"));
  const forwarderCompanyId = idSchema.safeParse(
    formData.get("forwarderCompanyId"),
  );

  if (!requestId.success || !forwarderCompanyId.success) {
    redirect("/app/requests?error=invalid-message-target");
  }

  try {
    const conversationId = await getOrCreateConversationForCurrentImporter(
      requestId.data,
      forwarderCompanyId.data,
    );

    redirect(`/app/requests/messages/${conversationId}`);
  } catch (error) {
    if (error instanceof RateLimitError) {
      redirect(`/app/requests/${requestId.data}?messageError=rate_limited`);
    } else if (error instanceof MessagingAccessError) {
      redirect(`/app/requests/${requestId.data}?messageError=${error.code}`);
    }

    throw error;
  }
}

async function decideQuote(formData: FormData, decision: "accept" | "reject") {
  const requestId = idSchema.safeParse(formData.get("requestId"));
  const quoteId = idSchema.safeParse(formData.get("quoteId"));

  if (!requestId.success || !quoteId.success) {
    redirect("/app/requests?error=invalid-quote-decision");
  }

  let target = `/app/requests/${requestId.data}?decision=${decision}`;

  try {
    if (decision === "accept") {
      const result = await acceptQuoteForCurrentImporter({
        requestId: requestId.data,
        quoteId: quoteId.data,
      });
      await runBestEffort(
        "funnel.quote_accepted_failed",
        async () => {
          const journeyId = await findJourneyForEntity({
            eventName: "request_posted",
            entityType: "shipment_request",
            entityId: result.requestId,
          });
          if (!journeyId) return;
          await recordFunnelEvent({
            journeyId,
            eventName: "quote_accepted",
            role: "importer",
            entityType: "quote",
            entityId: result.acceptedQuoteId,
          });
        },
        { requestId: result.requestId, quoteId: result.acceptedQuoteId },
      );
    } else {
      await rejectQuoteForCurrentImporter({
        requestId: requestId.data,
        quoteId: quoteId.data,
      });
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      target = `/app/requests/${requestId.data}?decisionError=rate_limited`;
    } else if (error instanceof QuoteDecisionError) {
      target = `/app/requests/${requestId.data}?decisionError=${error.code}`;
    } else {
      throw error;
    }
  }

  redirect(target);
}

function redirectToShareError(requestId: string, error: unknown): never {
  if (error instanceof RateLimitError) {
    redirect(`/app/requests/${requestId}?shareError=rate_limited`);
  }
  if (error instanceof RequestShareError) {
    redirect(`/app/requests/${requestId}?shareError=${error.code}`);
  }
  throw error;
}
