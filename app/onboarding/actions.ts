"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  normalizeAuthRedirectIntent,
  resolveAuthenticatedDestination,
} from "@/lib/auth-redirect";
import { createOnboardingProfile, onboardingSchema } from "@/lib/onboarding";
import { recordRequestFunnelEvent } from "@/lib/funnel-events";
import { runBestEffort } from "@/lib/best-effort";

export type OnboardingActionState = {
  status: "idle" | "error";
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialOnboardingActionState: OnboardingActionState = {
  status: "idle",
};

export async function completeOnboarding(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const intentValue = formData.get("intent");
  const intent = normalizeAuthRedirectIntent(
    typeof intentValue === "string" ? intentValue : undefined,
  );
  const parsed = onboardingSchema.safeParse({
    role: intent === "submit_quote" ? "forwarder" : formData.get("role"),
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    shippingModes: formData.get("shippingModes"),
    originCities: formData.get("originCities"),
    destinationAreas: formData.get("destinationAreas"),
    serviceDescription: formData.get("serviceDescription"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const redirectUrl =
    typeof formData.get("redirectUrl") === "string"
      ? (formData.get("redirectUrl") as string)
      : undefined;

  const result = await createOnboardingProfile(userId, parsed.data);

  await runBestEffort(
    "funnel.onboarding_completed_failed",
    () =>
      recordRequestFunnelEvent({
        eventName: "onboarding_completed",
        userProfileId: result.profile.id,
        role: result.profile.role,
        authIntent: intent,
        entityType: "profile",
        entityId: result.profile.id,
      }),
    { userProfileId: result.profile.id },
  );

  if (
    parsed.data.role === "forwarder" &&
    "forwarderCompany" in result &&
    result.forwarderCompany
  ) {
    const forwarderCompanyId = result.forwarderCompany.id;
    await runBestEffort(
      "funnel.forwarder_profile_ready_failed",
      () =>
        recordRequestFunnelEvent({
          eventName: "forwarder_profile_ready",
          userProfileId: result.profile.id,
          role: "forwarder",
          authIntent: intent,
          entityType: "forwarder_company",
          entityId: forwarderCompanyId,
        }),
      { forwarderCompanyId },
    );
  }

  redirect(
    resolveAuthenticatedDestination({
      role: result.profile.role,
      redirectPath: redirectUrl,
      intent,
    }),
  );
}
