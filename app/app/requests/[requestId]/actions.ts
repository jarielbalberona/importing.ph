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

  const request = await publishShipmentRequestForCurrentImporter(requestId.data);

  redirect(
    request
      ? `/app/requests/${requestId.data}?request=posted`
      : `/app/requests/${requestId.data}?requestError=publish-unavailable`,
  );
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
    if (error instanceof MessagingAccessError) {
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
      await acceptQuoteForCurrentImporter(quoteId.data);
    } else {
      await rejectQuoteForCurrentImporter(quoteId.data);
    }
  } catch (error) {
    if (error instanceof QuoteDecisionError) {
      target = `/app/requests/${requestId.data}?decisionError=${error.code}`;
    } else {
      throw error;
    }
  }

  redirect(target);
}
