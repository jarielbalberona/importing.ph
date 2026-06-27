export {
  MarketplaceNotificationEmail,
  renderMarketplaceNotificationEmail,
  type MarketplaceNotificationEmailProps,
} from "./templates/marketplace-notification";
export { EmailBodyText, EmailTitle } from "./components/email-body";
export { EmailButton } from "./components/email-button";
export { EmailFooter } from "./components/email-footer";
export { EmailHeader } from "./components/email-header";
export { EmailLayout } from "./components/email-layout";
export {
  buildMarketplaceNotificationEmail,
  sendMarketplaceNotificationEmail,
  type SendMarketplaceNotificationEmailInput,
} from "./resend";
