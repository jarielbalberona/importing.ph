import * as React from "react";

import { bodyStyle, containerStyle } from "./email-theme";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* This is an email document, not a Next.js page. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
        <title>{preview}</title>
      </head>
      <body style={bodyStyle}>
        <div
          style={{
            display: "none",
            maxHeight: 0,
            overflow: "hidden",
            opacity: 0,
          }}
        >
          {preview}
        </div>
        <main style={containerStyle}>{children}</main>
      </body>
    </html>
  );
}
