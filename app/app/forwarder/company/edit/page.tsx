import { PageHeader } from "@/components/app-shell";
import { ForwarderCompanySettingsForm } from "@/components/forms/forwarder-company-settings-form";
import { QueryStateToast } from "@/components/query-state-toast";
import Link from "next/link";
import {
  canEditForwarderCompanySettings,
  getForwarderCompanyPublicProfileStatusText,
  getForwarderCompanyPublicProfileUrl,
} from "@/lib/forwarder-company-profile";
import { getForwarderSettingsForCurrentUser } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type ForwarderCompanyEditPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForwarderCompanyEditPage({
  searchParams,
}: ForwarderCompanyEditPageProps) {
  const [{ company, quoteDefaults, member }, query] = await Promise.all([
    getForwarderSettingsForCurrentUser(),
    searchParams,
  ]);
  const publicProfileUrl = getForwarderCompanyPublicProfileUrl(company.slug);
  const canEdit = canEditForwarderCompanySettings(member.memberRole);
  const isEditingBlocked = company.isSuspended || !canEdit;
  const errorMessage =
    query.error === "validation"
      ? "Check the highlighted fields and try again."
      : query.error === "forbidden"
        ? "Only owner or admin company members can edit company settings."
        : query.error === "suspended"
          ? "Suspended companies cannot update public-facing company settings."
          : null;

  return (
    <>
      <PageHeader
        title="Edit company profile"
        description="Update company details, service coverage, and reusable quote defaults."
      />

      <div className="mt-6 grid gap-6">
        <QueryStateToast
          errorMessage={errorMessage}
          clearKeys={["error"]}
        />

        <section className="rounded-md border bg-background p-4 sm:p-5">
          <div className="grid gap-2">
            <h2 className="text-base font-semibold">Public company profile</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {getForwarderCompanyPublicProfileStatusText(company)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Public URL:</span>{" "}
              {publicProfileUrl ?? "Not available"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Slug:</span>{" "}
              {company.slug ?? "Not available"}
            </p>
            <p className="text-sm text-muted-foreground">
              Contact person and contact email are internal only and do not appear on the
              public profile.
            </p>
            {publicProfileUrl ? (
              <div>
                <Link
                  href={publicProfileUrl}
                  className="text-sm font-medium text-cyan-700 underline underline-offset-4"
                >
                  View public profile
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {company.isSuspended ? (
          <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            This company is suspended. Public profile editing is blocked until marketplace
            admins restore the account.
          </section>
        ) : null}

        {!canEdit ? (
          <section className="rounded-md border border-slate-300 bg-slate-50 p-4 text-sm text-slate-900">
            You can review company settings, but only owner or admin company members can
            save changes.
          </section>
        ) : null}

        <section className="rounded-md border bg-background p-4 sm:p-5">
          <ForwarderCompanySettingsForm
            cancelHref="/app/forwarder/company"
            canEdit={!isEditingBlocked}
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
