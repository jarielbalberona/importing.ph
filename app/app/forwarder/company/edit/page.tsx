import { PageHeader } from "@/components/app-shell";
import { ForwarderCompanySettingsForm } from "@/components/forms/forwarder-company-settings-form";
import { QueryStateToast } from "@/components/query-state-toast";
import { getForwarderSettingsForCurrentUser } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type ForwarderCompanyEditPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForwarderCompanyEditPage({
  searchParams,
}: ForwarderCompanyEditPageProps) {
  const [{ company, quoteDefaults }, query] = await Promise.all([
    getForwarderSettingsForCurrentUser(),
    searchParams,
  ]);

  return (
    <>
      <PageHeader
        title="Edit company profile"
        description="Update company details, service coverage, and reusable quote defaults."
      />

      <div className="mt-6 grid gap-6">
        <QueryStateToast
          errorMessage={
            query.error ? "Check the highlighted fields and try again." : null
          }
          clearKeys={["error"]}
        />

        <section className="rounded-md border bg-background p-4 sm:p-5">
          <ForwarderCompanySettingsForm
            cancelHref="/app/forwarder/company"
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
              defaultTransitMinDays:
                quoteDefaults?.transitMinDays?.toString() ?? "",
              defaultTransitMaxDays:
                quoteDefaults?.transitMaxDays?.toString() ?? "",
              defaultInclusions: quoteDefaults?.inclusions ?? "",
              defaultExclusions: quoteDefaults?.exclusions ?? "",
              defaultNotes: quoteDefaults?.notes ?? "",
              defaultValidForDays:
                quoteDefaults?.validForDays?.toString() ?? "",
            }}
          />
        </section>
      </div>
    </>
  );
}
