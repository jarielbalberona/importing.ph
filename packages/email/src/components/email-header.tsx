import { brandName, brandTextStyle } from "./email-theme";

export function EmailHeader() {
  return <p style={brandTextStyle}>{brandName}</p>;
}
