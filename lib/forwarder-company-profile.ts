import { getForwarderCompanyProfilePath } from "@/lib/forwarder-profile-page";

type ForwarderCompanyProfileFields = {
  name: string;
  slug: string | null;
  shippingModes: string | null;
  originCities: string | null;
  destinationAreas: string | null;
  serviceDescription: string | null;
};

const requiredPublicProfileFields = [
  {
    label: "company name",
    isFilled: (company: ForwarderCompanyProfileFields) =>
      company.name.trim().length >= 2,
  },
  {
    label: "shipping modes",
    isFilled: (company: ForwarderCompanyProfileFields) =>
      company.shippingModes === "sea" ||
      company.shippingModes === "air" ||
      company.shippingModes === "both",
  },
  {
    label: "service description",
    isFilled: (company: ForwarderCompanyProfileFields) =>
      Boolean(company.serviceDescription?.trim()),
  },
  {
    label: "pickup or origin cities",
    isFilled: (company: ForwarderCompanyProfileFields) =>
      Boolean(company.originCities?.trim()),
  },
  {
    label: "destination areas",
    isFilled: (company: ForwarderCompanyProfileFields) =>
      Boolean(company.destinationAreas?.trim()),
  },
] as const;

export function getForwarderCompanyPublicProfileCompleteness(
  company: ForwarderCompanyProfileFields,
) {
  const completedFields = requiredPublicProfileFields.filter((field) =>
    field.isFilled(company),
  );
  const missingFields = requiredPublicProfileFields
    .filter((field) => !field.isFilled(company))
    .map((field) => field.label);

  return {
    completedCount: completedFields.length,
    totalCount: requiredPublicProfileFields.length,
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function getForwarderCompanyPublicProfileStatusText(
  company: ForwarderCompanyProfileFields,
) {
  const completeness = getForwarderCompanyPublicProfileCompleteness(company);

  if (completeness.isComplete) {
    return `Public profile complete (${completeness.completedCount} of ${completeness.totalCount})`;
  }

  return `Public profile incomplete: add ${completeness.missingFields.join(", ")} (${completeness.completedCount} of ${completeness.totalCount})`;
}

export function getForwarderCompanyPublicProfileUrl(slug: string | null) {
  if (!slug) {
    return null;
  }

  return getForwarderCompanyProfilePath(slug);
}

export function canEditForwarderCompanySettings(memberRole: string) {
  return memberRole === "owner" || memberRole === "admin";
}
