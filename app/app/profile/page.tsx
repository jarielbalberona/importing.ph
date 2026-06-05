import { currentUser } from "@clerk/nextjs/server";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { ImporterProfileForm } from "@/components/forms/importer-profile-form";
import { QueryStateToast } from "@/components/query-state-toast";
import { getImporterSettingsForCurrentUser } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type ImporterProfilePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function ImporterProfilePage({
  searchParams,
}: ImporterProfilePageProps) {
  const [{ profile, importerProfile }, user, query] = await Promise.all([
    getImporterSettingsForCurrentUser(),
    currentUser(),
    searchParams,
  ]);

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Keep your contact details updated so forwarders know who they are quoting."
        actions={
          <ImporterProfileForm
            defaultValues={{
              fullName: profile.fullName,
              companyName: importerProfile.companyName,
              location: importerProfile.location ?? "",
              contactPhone: importerProfile.contactPhone ?? "",
            }}
          />
        }
      />

      <div className="mt-6 grid gap-6">
        <QueryStateToast
          successMessage={query.saved ? "Profile saved." : null}
          errorMessage={
            query.error ? "Check the highlighted fields and try again." : null
          }
          clearKeys={["saved", "error"]}
        />

        <section className="overflow-hidden rounded-md border bg-background">
          <ProfileSection
            title="Basic information"
            description="Details forwarders use when preparing quotes."
          >
            <ProfileRow label="Contact name" value={profile.fullName} />
            <ProfileRow
              label="Company or business name"
              value={importerProfile.companyName}
            />
            <ProfileRow
              label="Philippines location"
              value={importerProfile.location}
            />
            <ProfileRow
              label="Contact number"
              value={importerProfile.contactPhone}
            />
          </ProfileSection>

          <ProfileSection
            title="Account details"
            description="Managed account information."
          >
            <ProfileRow label="Email" value={email ?? "Not provided"} />
            <ProfileRow
              label="Account type"
              value={<Badge variant="secondary">Importer</Badge>}
            />
          </ProfileSection>
        </section>
      </div>
    </>
  );
}

function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b last:border-b-0">
      <div className="border-b px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <dl className="divide-y">{children}</dl>
    </section>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-6 sm:px-5">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm leading-6">
        {value || "Not provided"}
      </dd>
    </div>
  );
}
