import * as React from "react";

import { dividerStyle, footerStyle } from "./email-theme";

export function EmailFooter({
  children = "This message is about your importing.ph marketplace activity.",
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <hr style={dividerStyle} />
      <p style={footerStyle}>{children}</p>
    </>
  );
}
