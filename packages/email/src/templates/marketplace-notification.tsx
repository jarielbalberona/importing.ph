import { render } from "@react-email/render";
import * as React from "react";

import { EmailBodyText, EmailTitle } from "../components/email-body";
import { EmailButton } from "../components/email-button";
import { EmailFooter } from "../components/email-footer";
import { EmailHeader } from "../components/email-header";
import { EmailLayout } from "../components/email-layout";

export type MarketplaceNotificationEmailProps = {
  recipientName?: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
};

export function MarketplaceNotificationEmail({
  recipientName,
  title,
  body,
  actionLabel,
  actionUrl,
}: MarketplaceNotificationEmailProps) {
  return (
    <EmailLayout preview={title}>
      <EmailHeader />
      <EmailTitle>{title}</EmailTitle>
      <EmailBodyText>
        {recipientName ? `Hi ${recipientName},` : "Hi,"}
      </EmailBodyText>
      <EmailBodyText>{body}</EmailBodyText>
      <EmailButton href={actionUrl}>{actionLabel}</EmailButton>
      <EmailFooter />
    </EmailLayout>
  );
}

export async function renderMarketplaceNotificationEmail(
  props: MarketplaceNotificationEmailProps,
) {
  const element = <MarketplaceNotificationEmail {...props} />;

  return {
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}
