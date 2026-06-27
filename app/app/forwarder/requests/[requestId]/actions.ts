"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createQuoteForCurrentForwarder,
  QuoteSubmissionError,
  updateQuoteForCurrentForwarder,
  withdrawQuoteForCurrentForwarder,
} from "@/lib/quotes";
import {
  getOrCreateConversationForCurrentForwarder,
  MessagingAccessError,
} from "@/lib/messages";
import { quoteSubmissionInputFromFormData } from "@/lib/validation";

const requestIdSchema = z.string().uuid();

export async function submitQuote(formData: FormData) {
  const requestId = requestIdSchema.safeParse(formData.get("requestId"));

  if (!requestId.success) {
    redirect("/app/forwarder/requests?error=invalid-request");
  }

  let target = `/app/forwarder/requests/${requestId.data}?quote=submitted`;

  try {
    await createQuoteForCurrentForwarder(
      requestId.data,
      quoteSubmissionInputFromFormData(formData),
    );
  } catch (error) {
    if (error instanceof QuoteSubmissionError) {
      target = `/app/forwarder/requests/${requestId.data}/quote?error=${error.code}`;
    } else if (error instanceof z.ZodError) {
      target = `/app/forwarder/requests/${requestId.data}/quote?error=validation`;
    } else {
      throw error;
    }
  }

  redirect(target);
}

export async function updateQuote(formData: FormData) {
  const requestId = requestIdSchema.safeParse(formData.get("requestId"));
  const quoteId = requestIdSchema.safeParse(formData.get("quoteId"));

  if (!requestId.success || !quoteId.success) {
    redirect("/app/forwarder/requests?error=invalid-request");
  }

  let target = `/app/forwarder/requests/${requestId.data}?quote=updated`;

  try {
    await updateQuoteForCurrentForwarder(
      quoteId.data,
      quoteSubmissionInputFromFormData(formData),
    );
  } catch (error) {
    if (error instanceof QuoteSubmissionError) {
      target = `/app/forwarder/requests/${requestId.data}/quote?mode=edit&error=${error.code}`;
    } else if (error instanceof z.ZodError) {
      target = `/app/forwarder/requests/${requestId.data}/quote?mode=edit&error=validation`;
    } else {
      throw error;
    }
  }

  redirect(target);
}

export async function withdrawQuote(formData: FormData) {
  const requestId = requestIdSchema.safeParse(formData.get("requestId"));
  const quoteId = requestIdSchema.safeParse(formData.get("quoteId"));

  if (!requestId.success || !quoteId.success) {
    redirect("/app/forwarder/requests?error=invalid-request");
  }

  const quote = await withdrawQuoteForCurrentForwarder(quoteId.data);

  redirect(
    quote
      ? `/app/forwarder/requests/${requestId.data}?quote=withdrawn`
      : `/app/forwarder/requests/${requestId.data}?quoteError=withdraw-unavailable`,
  );
}

export async function startForwarderConversation(formData: FormData) {
  const requestId = requestIdSchema.safeParse(formData.get("requestId"));

  if (!requestId.success) {
    redirect("/app/forwarder/requests?error=invalid-request");
  }

  try {
    const conversationId = await getOrCreateConversationForCurrentForwarder(
      requestId.data,
    );

    redirect(`/app/forwarder/messages/${conversationId}`);
  } catch (error) {
    if (error instanceof MessagingAccessError) {
      redirect(`/app/forwarder/requests/${requestId.data}?messageError=${error.code}`);
    }

    throw error;
  }
}
