"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";
import { createOnboardingProfile, onboardingSchema } from "@/lib/onboarding";

export async function completeOnboarding(formData: FormData) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const parsed = onboardingSchema.parse({
    role: formData.get("role"),
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
  });
  const redirectUrl =
    typeof formData.get("redirectUrl") === "string"
      ? (formData.get("redirectUrl") as string)
      : undefined;
  const intent =
    typeof formData.get("intent") === "string"
      ? (formData.get("intent") as string)
      : undefined;

  const result = await createOnboardingProfile(userId, parsed);

  redirect(
    resolveAuthenticatedDestination({
      role: result.profile.role,
      redirectPath: redirectUrl,
      intent,
    }),
  );
}
