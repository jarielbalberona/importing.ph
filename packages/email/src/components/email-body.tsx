import { Heading, Text } from "@react-email/components";
import * as React from "react";

import { headingStyle, textStyle } from "./email-theme";

export function EmailTitle({ children }: { children: React.ReactNode }) {
  return <Heading style={headingStyle}>{children}</Heading>;
}

export function EmailBodyText({ children }: { children: React.ReactNode }) {
  return <Text style={textStyle}>{children}</Text>;
}
