"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { updateImporterSettingsForCurrentUser } from "@/lib/profile-settings";
import { importerProfileSettingsInputFromFormData } from "@/lib/validation";

export async function saveImporterProfile(formData: FormData) {
  try {
    await updateImporterSettingsForCurrentUser(
      importerProfileSettingsInputFromFormData(formData),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      redirect("/app/profile?error=validation");
    }

    throw error;
  }

  redirect("/app/profile?saved=1");
}
