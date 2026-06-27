import { Text } from "@react-email/components";
import * as React from "react";

import { brandName, brandTextStyle } from "./email-theme";

export function EmailHeader() {
  return <Text style={brandTextStyle}>{brandName}</Text>;
}
