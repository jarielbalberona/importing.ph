"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createOnboardingProfile, onboardingSchema } from "@/lib/onboarding";
import { destinationForRole } from "@/lib/routes";

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

  const result = await createOnboardingProfile(userId, parsed);

  redirect(destinationForRole(result.profile.role));
}
