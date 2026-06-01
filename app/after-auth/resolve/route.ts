import { redirect } from "next/navigation";

import { getProfileForCurrentUser } from "@/lib/authz";
import { destinationForRole } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function GET() {
  const { profile } = await getProfileForCurrentUser();

  if (!profile) {
    redirect("/onboarding");
  }

  redirect(destinationForRole(profile.role));
}
