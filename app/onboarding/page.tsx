import { redirect } from "next/navigation";

import { getProfileForCurrentUser } from "@/lib/authz";
import {
  JOIN_AS_FORWARDER_INTENT,
  normalizeAuthRedirectIntent,
  resolveAuthenticatedDestination,
  SUBMIT_QUOTE_INTENT,
} from "@/lib/auth-redirect";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; intent?: string }>;
}) {
  const { profile } = await getProfileForCurrentUser();
  const params = await searchParams;
  const intent = normalizeAuthRedirectIntent(params.intent);

  if (profile) {
    redirect(
      resolveAuthenticatedDestination({
        role: profile.role,
        redirectPath: params.redirect_url,
        intent,
      }),
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-muted px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-700">
            Onboarding
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Set up your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {intent === SUBMIT_QUOTE_INTENT
              ? "Set up a forwarding account to submit your quotation."
              : "Tell us how you will use importing.ph so we can show the right tools."}
          </p>
        </div>
        <OnboardingForm
          initialRole={
            intent === JOIN_AS_FORWARDER_INTENT || intent === SUBMIT_QUOTE_INTENT
              ? "forwarder"
              : "importer"
          }
          lockForwarderRole={intent === SUBMIT_QUOTE_INTENT}
          redirectUrl={params.redirect_url}
          intent={intent ?? undefined}
        />
      </div>
    </main>
  );
}
