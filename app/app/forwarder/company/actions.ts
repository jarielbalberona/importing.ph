"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ForwarderCompanySettingsAccessError,
  updateForwarderSettingsForCurrentUser,
} from "@/lib/profile-settings";
import { forwarderCompanySettingsInputFromFormData } from "@/lib/validation";
import { recordRequestFunnelEvent } from "@/lib/funnel-events";
import { runBestEffort } from "@/lib/best-effort";

export async function saveForwarderCompanySettings(formData: FormData) {
  try {
    const result = await updateForwarderSettingsForCurrentUser(
      forwarderCompanySettingsInputFromFormData(formData),
    );
    if (result.isReady) {
      await runBestEffort(
        "funnel.forwarder_profile_ready_failed",
        () =>
          recordRequestFunnelEvent({
            eventName: "forwarder_profile_ready",
            userProfileId: result.profileId,
            role: "forwarder",
            entityType: "forwarder_company",
            entityId: result.companyId,
          }),
        { forwarderCompanyId: result.companyId },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      redirect("/app/forwarder/company/edit?error=validation");
    }

    if (error instanceof ForwarderCompanySettingsAccessError) {
      redirect(`/app/forwarder/company/edit?error=${error.code}`);
    }

    throw error;
  }

  redirect("/app/forwarder/company?saved=1");
}
