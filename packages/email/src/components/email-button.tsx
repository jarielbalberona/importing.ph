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
    <a href={absoluteUrl(href)} style={buttonStyle}>
      {children}
    </a>
  );
}
