"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { markNotificationReadForCurrentUser } from "@/lib/notifications";

const idSchema = z.string().uuid();

export async function markNotificationRead(formData: FormData) {
  const notificationId = idSchema.safeParse(formData.get("notificationId"));

  if (!notificationId.success) {
    redirect("/app/notifications?error=invalid-notification");
  }

  await markNotificationReadForCurrentUser(notificationId.data);

  redirect("/app/notifications");
}
