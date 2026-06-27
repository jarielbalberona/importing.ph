import Link from "next/link";

import { PageHeader, StatusBadge } from "@/components/app-shell";
import { QueryStateToast } from "@/components/query-state-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  canEditForwarderCompanySettings,
  getForwarderCompanyPublicProfileCompleteness,
  getForwarderCompanyPublicProfileStatusText,
  getForwarderCompanyPublicProfileUrl,
} from "@/lib/forwarder-company-profile";
import { getForwarderSettingsForCurrentUser } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type ForwarderCompanyPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function ForwarderCompanyPage({
  searchParams,
}: ForwarderCompanyPageProps) {
  const [{ company, member, quoteDefaults }, query] = await Promise.all([
    getForwarderSettingsForCurrentUser(),
    searchParams,
  ]);
  const publicProfileUrl = getForwarderCompanyPublicProfileUrl(company.slug);
  const publicProfileCompleteness =
    getForwarderCompanyPublicProfileCompleteness(company);
  const completenessPercent = Math.round(
    (publicProfileCompleteness.completedCount /
      publicProfileCompleteness.totalCount) *
      100,
  );
  const canEdit = canEditForwarderCompanySettings(member.memberRole);

  return (
    <>
      <PageHeader
        title="Company profile"
        description="Review the company details importers see and the defaults used when preparing quotes."
        actions={
          canEdit && !company.isSuspended ? (
            <Button asChild variant="outline">
              <Link href="/app/forwarder/company/edit">Edit company</Link>
            </Button>
          ) : null
        }
      />

      <div className="mt-6 grid gap-6">
        <QueryStateToast
          successMessage={query.saved ? "Company settings saved." : null}
          clearKeys={["saved"]}
        />

        <section className="rounded-md border bg-background p-4 sm:p-5">
          <div className="grid gap-4 sm:flex sm:items-start sm:justify-between">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">Public company profile</h2>
                <Badge
                  variant={
                    publicProfileCompleteness.isComplete ? "default" : "secondary"
                  }
                >
                  {publicProfileCompleteness.isComplete ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {getForwarderCompanyPublicProfileStatusText(company)}
              </p>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span>Profile completeness</span>
                  <span>{completenessPercent}%</span>
                </div>
                <Progress value={completenessPercent} />
                {publicProfileCompleteness.missingFields.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {publicProfileCompleteness.missingFields.map((field) => (
                      <Badge key={field} variant="outline">
                        Add {field}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="grid gap-1 text-sm">
                <p>
                  <span className="font-medium">Public URL:</span>{" "}
                  {publicProfileUrl ?? "Not available"}
                </p>
                <p>
                  <span className="font-medium">Slug:</span>{" "}
                  {company.slug ?? "Not available"}
                </p>
                <p className="text-muted-foreground">
                  Contact person and contact email stay internal and are not shown on the
                  public profile.
                </p>
              </div>
            </div>
            {publicProfileUrl ? (
              <Button asChild variant="outline">
                <Link href={publicProfileUrl}>View public profile</Link>
              </Button>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-md border bg-background">
          <ProfileSection
            title="Public company profile"
            description="These fields appear on the public forwarder company profile."
          >
            <ProfileRow label="Company name" value={company.name} />
            <ProfileRow
              label="Supported shipping modes"
              value={shippingModesLabel(company.shippingModes)}
            />
          </ProfileSection>

          <ProfileSection
            title="Service coverage"
            description="Common service lanes and practical coverage notes."
          >
            <ProfileRow
              label="Main China origin cities"
              value={company.originCities}
            />
            <ProfileRow
              label="Main Philippines destinations"
              value={company.destinationAreas}
            />
            <ProfileRow
              label="Service description"
              value={company.serviceDescription}
            />
          </ProfileSection>

          <ProfileSection
            title="Internal contact details"
            description="These fields help with internal operations and are not shown on the public company profile."
          >
            <ProfileRow label="Contact person" value={company.contactPerson} />
            <ProfileRow label="Contact email" value={company.contactEmail} />
          </ProfileSection>

          <ProfileSection
            title="Quote defaults"
            description="Reusable defaults for faster quote preparation. These do not replace per-request quote review."
          >
            <ProfileRow
              label="Default currency"
              value={quoteDefaults?.currency ?? "PHP"}
            />
            <ProfileRow
              label="Quote valid for"
              value={
                quoteDefaults?.validForDays
                  ? `${quoteDefaults.validForDays} days`
                  : null
              }
            />
            <ProfileRow
              label="Transit range"
              value={transitRange(
                quoteDefaults?.transitMinDays,
                quoteDefaults?.transitMaxDays,
              )}
            />
            <ProfileRow
              label="Default service offered"
              value={quoteDefaults?.serviceOffered}
            />
            <ProfileRow
              label="Default inclusions"
              value={quoteDefaults?.inclusions}
            />
            <ProfileRow
              label="Default exclusions"
              value={quoteDefaults?.exclusions}
            />
            <ProfileRow label="Default notes" value={quoteDefaults?.notes} />
          </ProfileSection>

          <ProfileSection
            title="Account status"
            description="Marketplace safety status is managed by marketplace admins."
          >
            <ProfileRow
              label="Company status"
              value={
                <StatusBadge>
                  {company.isSuspended ? "Suspended" : "Active"}
                </StatusBadge>
              }
            />
            <ProfileRow
              label="Quoting access"
              value={
                company.isSuspended
                  ? "This company cannot submit quotes while suspended."
                  : "This company can submit quotes on open shipment requests."
              }
            />
            <ProfileRow
              label="Member role"
              value={<Badge variant="secondary">{member.memberRole}</Badge>}
            />
            {!canEdit ? (
              <ProfileRow
                label="Editing access"
                value="Only owner or admin company members can edit company settings."
              />
            ) : null}
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
      <dd className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function shippingModesLabel(value: string | null) {
  if (value === "sea") {
    return "Sea freight";
  }

  if (value === "air") {
    return "Air freight";
  }

  if (value === "both") {
    return "Sea and air";
  }

  return null;
}

function transitRange(
  minDays: number | null | undefined,
  maxDays: number | null | undefined,
) {
  if (minDays && maxDays) {
    return `${minDays}-${maxDays} days`;
  }

  if (minDays) {
    return `From ${minDays} days`;
  }

  if (maxDays) {
    return `Up to ${maxDays} days`;
  }

  return null;
}
