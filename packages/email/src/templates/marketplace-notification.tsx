import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import * as React from "react";

export type MarketplaceNotificationEmailProps = {
  recipientName?: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
};

const baseUrl = "https://importing.ph";

export function MarketplaceNotificationEmail({
  recipientName,
  title,
  body,
  actionLabel,
  actionUrl,
}: MarketplaceNotificationEmailProps) {
  const absoluteActionUrl = actionUrl.startsWith("http")
    ? actionUrl
    : `${baseUrl}${actionUrl}`;

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={eyebrowStyle}>importing.ph</Text>
            <Heading style={headingStyle}>{title}</Heading>
            <Text style={textStyle}>
              {recipientName ? `Hi ${recipientName},` : "Hi,"}
            </Text>
            <Text style={textStyle}>{body}</Text>
            <Button href={absoluteActionUrl} style={buttonStyle}>
              {actionLabel}
            </Button>
            <Hr style={dividerStyle} />
            <Text style={footerStyle}>
              This message is about your importing.ph marketplace activity.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
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

const bodyStyle = {
  margin: 0,
  backgroundColor: "#f6f7f9",
  color: "#172033",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const containerStyle = {
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 24px",
};

const eyebrowStyle = {
  margin: "0 0 12px",
  color: "#1f6feb",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

const headingStyle = {
  margin: "0 0 20px",
  fontSize: "28px",
  lineHeight: "34px",
};

const textStyle = {
  margin: "0 0 16px",
  fontSize: "16px",
  lineHeight: "24px",
};

const buttonStyle = {
  display: "inline-block",
  marginTop: "8px",
  padding: "12px 18px",
  borderRadius: "6px",
  backgroundColor: "#1f6feb",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
};

const dividerStyle = {
  margin: "28px 0 16px",
  borderColor: "#d9dee7",
};

const footerStyle = {
  margin: 0,
  color: "#667085",
  fontSize: "13px",
  lineHeight: "20px",
};
