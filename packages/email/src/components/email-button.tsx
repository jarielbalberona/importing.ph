import { Button } from "@react-email/components";
import * as React from "react";

import { absoluteUrl, buttonStyle } from "./email-theme";

export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button href={absoluteUrl(href)} style={buttonStyle}>
      {children}
    </Button>
  );
}
