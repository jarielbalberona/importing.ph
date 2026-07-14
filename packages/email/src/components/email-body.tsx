import * as React from "react";

import { headingStyle, textStyle } from "./email-theme";

export function EmailTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={headingStyle}>{children}</h1>;
}

export function EmailBodyText({ children }: { children: React.ReactNode }) {
  return <p style={textStyle}>{children}</p>;
}
