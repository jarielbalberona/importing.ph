import { redirect } from "next/navigation";

import {
  normalizeAppRedirectPath,
  resolveAuthenticatedDestination,
  resolveOnboardingDestination,
} from "@/lib/auth-redirect";
import { getProfileForCurrentUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { profile } = await getProfileForCurrentUser();
  const url = new URL(request.url);
  const redirectUrl = normalizeAppRedirectPath(
    url.searchParams.get("redirect_url"),
  );
  const intent = url.searchParams.get("intent");

  if (!profile) {
    redirect(
      resolveOnboardingDestination({
        redirectPath: redirectUrl,
        intent,
      }),
    );
  }

  redirect(
    resolveAuthenticatedDestination({
      role: profile.role,
      redirectPath: redirectUrl,
      intent,
    }),
  );
}
