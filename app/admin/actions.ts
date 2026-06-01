"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  suspendForwarderCompanyForCurrentAdmin,
  unsuspendForwarderCompanyForCurrentAdmin,
} from "@/lib/admin";

const idSchema = z.string().uuid();

export async function suspendForwarderCompany(formData: FormData) {
  const forwarderCompanyId = idSchema.safeParse(
    formData.get("forwarderCompanyId"),
  );
  const reason = z
    .string()
    .trim()
    .min(1)
    .max(500)
    .safeParse(formData.get("reason"));

  if (!forwarderCompanyId.success || !reason.success) {
    redirect("/admin?error=invalid-suspension");
  }

  await suspendForwarderCompanyForCurrentAdmin({
    forwarderCompanyId: forwarderCompanyId.data,
    reason: reason.data,
  });

  revalidatePath("/admin");
  redirect("/admin?safety=suspended");
}

export async function unsuspendForwarderCompany(formData: FormData) {
  const forwarderCompanyId = idSchema.safeParse(
    formData.get("forwarderCompanyId"),
  );

  if (!forwarderCompanyId.success) {
    redirect("/admin?error=invalid-suspension");
  }

  await unsuspendForwarderCompanyForCurrentAdmin(forwarderCompanyId.data);

  revalidatePath("/admin");
  redirect("/admin?safety=unsuspended");
}
