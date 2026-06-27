import { Resend } from "resend";

import {
  renderMarketplaceNotificationEmail,
  type MarketplaceNotificationEmailProps,
} from "./templates/marketplace-notification";

export type SendMarketplaceNotificationEmailInput =
  MarketplaceNotificationEmailProps & {
    to: string;
    from?: string;
    subject?: string;
    apiKey?: string;
  };

export async function buildMarketplaceNotificationEmail(
  input: SendMarketplaceNotificationEmailInput,
) {
  const rendered = await renderMarketplaceNotificationEmail(input);

  return {
    from:
      input.from ??
      process.env.EMAIL_FROM ??
      "importing.ph <notifications@importing.ph>",
    to: input.to,
    subject: input.subject ?? input.title,
    html: rendered.html,
    text: rendered.text,
  };
}

export async function sendMarketplaceNotificationEmail(
  input: SendMarketplaceNotificationEmailInput,
) {
  const apiKey = input.apiKey ?? process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send marketplace email.");
  }

  const resend = new Resend(apiKey);
  const payload = await buildMarketplaceNotificationEmail(input);

  return resend.emails.send(payload);
}
