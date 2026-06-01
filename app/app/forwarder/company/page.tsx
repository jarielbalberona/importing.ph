import {
  DetailCard,
  DetailValue,
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "@/components/app-shell";
import { ForwarderCompanySettingsForm } from "@/components/forms/forwarder-company-settings-form";
import { getForwarderSettingsForCurrentUser } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type ForwarderCompanyPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function ForwarderCompanyPage({
  searchParams,
}: ForwarderCompanyPageProps) {
  const [{ company, quoteDefaults }, query] = await Promise.all([
    getForwarderSettingsForCurrentUser(),
    searchParams,
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Forwarder"
        title="Company profile"
        description="Keep your company details, service coverage, and quote defaults updated."
      />

      <div className="mt-6 grid gap-6">
        {query.saved ? (
          <div className="rounded-md border border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-900">
            Company settings saved.
          </div>
        ) : null}

        {query.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Check the highlighted fields and try again.
          </div>
        ) : null}

        <DetailCard
          title="Account status"
          description="Marketplace safety status is managed by marketplace admins."
        >
          <InfoGrid columns={2}>
            <DetailValue
              label="Company status"
              value={
                <StatusBadge>
                  {company.isSuspended ? "Suspended" : "Active"}
                </StatusBadge>
              }
            />
            <DetailValue
              label="Quoting access"
              value={
                company.isSuspended
                  ? "This company cannot submit quotes while suspended."
                  : "This company can submit quotes on open shipment requests."
              }
            />
          </InfoGrid>
        </DetailCard>

        <DetailCard>
          <ForwarderCompanySettingsForm
            defaultValues={{
              companyName: company.name,
              contactPerson: company.contactPerson ?? "",
              contactEmail: company.contactEmail ?? "",
              originCities: company.originCities ?? "",
              destinationAreas: company.destinationAreas ?? "",
              shippingModes:
                company.shippingModes === "sea" ||
                company.shippingModes === "air" ||
                company.shippingModes === "both"
                  ? company.shippingModes
                  : "both",
              serviceDescription: company.serviceDescription ?? "",
              defaultCurrency: quoteDefaults?.currency ?? "PHP",
              defaultServiceOffered: quoteDefaults?.serviceOffered ?? "",
              defaultTransitMinDays: quoteDefaults?.transitMinDays?.toString() ?? "",
              defaultTransitMaxDays: quoteDefaults?.transitMaxDays?.toString() ?? "",
              defaultInclusions: quoteDefaults?.inclusions ?? "",
              defaultExclusions: quoteDefaults?.exclusions ?? "",
              defaultNotes: quoteDefaults?.notes ?? "",
              defaultValidForDays: quoteDefaults?.validForDays?.toString() ?? "",
            }}
          />
        </DetailCard>
      </div>
    </>
  );
}
