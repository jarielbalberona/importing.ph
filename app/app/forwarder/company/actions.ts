"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ForwarderCompanySettingsAccessError,
  updateForwarderSettingsForCurrentUser,
} from "@/lib/profile-settings";
import { forwarderCompanySettingsInputFromFormData } from "@/lib/validation";

export async function saveForwarderCompanySettings(formData: FormData) {
  try {
    await updateForwarderSettingsForCurrentUser(
      forwarderCompanySettingsInputFromFormData(formData),
    );
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
