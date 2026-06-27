import { Hr, Text } from "@react-email/components";
import * as React from "react";

import { dividerStyle, footerStyle } from "./email-theme";

export function EmailFooter({
  children = "This message is about your importing.ph marketplace activity.",
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <Hr style={dividerStyle} />
      <Text style={footerStyle}>{children}</Text>
    </>
  );
}
