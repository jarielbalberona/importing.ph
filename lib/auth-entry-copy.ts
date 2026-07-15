import {
  JOIN_AS_FORWARDER_INTENT,
  POST_SHIPMENT_REQUEST_INTENT,
  SUBMIT_QUOTE_INTENT,
  normalizeAuthRedirectIntent,
} from "@/lib/auth-redirect";

export function authEntryCopy(
  mode: "sign-in" | "sign-up",
  intentInput: string | null | undefined,
) {
  const intent = normalizeAuthRedirectIntent(intentInput);
  const isSignUp = mode === "sign-up";

  if (intent === POST_SHIPMENT_REQUEST_INTENT) {
    return {
      title: isSignUp ? "Create your importer account" : "Sign in as an importer",
      description: "Post your shipment once and receive private quotes from forwarders.",
    };
  }

  if (intent === SUBMIT_QUOTE_INTENT) {
    return {
      title: isSignUp
        ? "Create a forwarder account to quote this shipment"
        : "Sign in to quote this shipment",
      description: "Complete your forwarding company setup, then send a private quotation.",
    };
  }

  if (intent === JOIN_AS_FORWARDER_INTENT) {
    return {
      title: isSignUp ? "Create your forwarder account" : "Sign in as a forwarder",
      description: "Find matching shipment requests and send private quotations.",
    };
  }

  return {
    title: isSignUp ? "Create your account" : "Sign in",
    description: isSignUp
      ? "Post shipment requests or send private shipping quotations."
      : "Continue to your importer or forwarder workspace.",
  };
}
