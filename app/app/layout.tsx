import { AppShell } from "@/components/app-shell";
import { getAppBadgeStateForCurrentUser } from "@/lib/app-badges";
import { requireProfile } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const badgeState = await getAppBadgeStateForCurrentUser();

  return (
    <AppShell role={profile.role} badgeState={badgeState}>
      {children}
    </AppShell>
  );
}
