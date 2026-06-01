import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return <AppShell role={profile.role}>{children}</AppShell>;
}
