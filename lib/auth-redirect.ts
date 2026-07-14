import type { UserRole } from "@/db/schema";
import { destinationForRole } from "@/lib/routes";

export const POST_SHIPMENT_REQUEST_INTENT = "post_shipment_request" as const;
export const SUBMIT_QUOTE_INTENT = "submit_quote" as const;

export type AuthRedirectIntent =
  | typeof POST_SHIPMENT_REQUEST_INTENT
  | typeof SUBMIT_QUOTE_INTENT;

export function normalizeAppRedirectPath(
  input: string | null | undefined,
): string | null {
  if (!input) {
    return null;
  }

  const value = input.trim();

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null;
  }

  try {
    const url = new URL(value, "https://importing.ph");

    if (url.origin !== "https://importing.ph" || !url.pathname.startsWith("/")) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function normalizeAuthRedirectIntent(
  input: string | null | undefined,
): AuthRedirectIntent | null {
  if (
    input === POST_SHIPMENT_REQUEST_INTENT ||
    input === SUBMIT_QUOTE_INTENT
  ) {
    return input;
  }

  return null;
}

export function appendAuthRedirectParams(
  path: string,
  options: {
    redirectPath?: string | null | undefined;
    intent?: string | null | undefined;
  },
) {
  const params = new URLSearchParams();
  const redirectPath = normalizeAppRedirectPath(options.redirectPath);
  const intent = normalizeAuthRedirectIntent(options.intent);

  if (redirectPath) {
    params.set("redirect_url", redirectPath);
  }

  if (intent) {
    params.set("intent", intent);
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export function buildAfterAuthRedirectUrl(options: {
  redirectPath?: string | null | undefined;
  intent?: string | null | undefined;
}) {
  return appendAuthRedirectParams("/after-auth", options);
}

export function resolveAuthenticatedDestination(options: {
  role: UserRole;
  redirectPath?: string | null | undefined;
  intent?: string | null | undefined;
}) {
  const intent = normalizeAuthRedirectIntent(options.intent);
  const redirectPath = normalizeAppRedirectPath(options.redirectPath);

  if (intent === POST_SHIPMENT_REQUEST_INTENT) {
    if (options.role === "importer") {
      return "/app/requests/new";
    }

    return destinationForRole(options.role);
  }

  if (redirectPath) {
    return redirectPath;
  }

  return destinationForRole(options.role);
}

export function resolveOnboardingDestination(options: {
  redirectPath?: string | null | undefined;
  intent?: string | null | undefined;
}) {
  return appendAuthRedirectParams("/onboarding", options);
}
