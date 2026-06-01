import { currentUser } from "@clerk/nextjs/server";

import {
  DetailCard,
  DetailValue,
  InfoGrid,
  PageHeader,
} from "@/components/app-shell";
import { ImporterProfileForm } from "@/components/forms/importer-profile-form";
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
        eyebrow="Importer"
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
        {query.saved ? (
          <div className="rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
            Profile saved.
          </div>
        ) : null}

        {query.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Check the highlighted fields and try again.
          </div>
        ) : null}

        <DetailCard
          title="Basic information"
          description="These details help forwarders understand who they are quoting."
        >
          <InfoGrid columns={2}>
            <DetailValue label="Contact name" value={profile.fullName} />
            <DetailValue
              label="Company or business name"
              value={importerProfile.companyName}
            />
            <DetailValue
              label="Philippines location"
              value={importerProfile.location}
            />
            <DetailValue
              label="Contact number"
              value={importerProfile.contactPhone}
            />
          </InfoGrid>
        </DetailCard>

        <DetailCard
          title="Account details"
          description="Some account details are managed outside this page."
        >
          <InfoGrid columns={2}>
            <DetailValue label="Email" value={email ?? "Not provided"} />
            <DetailValue label="Account type" value="Importer" />
          </InfoGrid>
        </DetailCard>
      </div>
    </>
  );
}
