import type { Metadata } from "next";

import type { PublicForwarderCompanyProfile } from "@/lib/profile-route-queries";
import { getSiteUrl } from "@/features/public-content/seo/routes";
import { POST_SHIPMENT_REQUEST_INTENT } from "@/lib/auth-redirect";

export type ForwarderProfileCta = {
  href: string;
  label: string;
  variant: "default" | "outline";
  description: string;
};

export function getForwarderCompanyProfilePath(companySlug: string) {
  return `/forwarder/${companySlug}`;
}

export function buildForwarderProfileDescription(
  profile: Pick<PublicForwarderCompanyProfile, "name" | "serviceDescription">,
) {
  return (
    profile.serviceDescription?.trim() ||
    `${profile.name} is a forwarder company on Importing Philippines. Post a shipment request to receive private quotes through the platform.`
  );
}

export function buildForwarderCompanyProfileMetadata(
  profile: PublicForwarderCompanyProfile,
): Metadata {
  const title = `${profile.name} | Forwarder Profile | Importing Philippines`;
  const description = buildForwarderProfileDescription(profile);
  const canonical = getForwarderCompanyProfilePath(profile.slug);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: getSiteUrl(canonical),
      images: [getSiteUrl("/assets/importingph-logo-bg-blue.png")],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getSiteUrl("/assets/importingph-logo-bg-blue.png")],
    },
  };
}

export function resolveForwarderProfileCta(input: {
  companySlug: string;
  viewerRole?: "importer" | "forwarder" | "admin" | undefined;
}) {
  const returnUrl = encodeURIComponent(
    getForwarderCompanyProfilePath(input.companySlug),
  );

  const guestCta: ForwarderProfileCta = {
    href: `/sign-up?redirect_url=${returnUrl}&intent=${POST_SHIPMENT_REQUEST_INTENT}`,
    label: "Post a shipment request",
    variant: "default",
    description:
      "Create an account so you can post a shipment request and receive private forwarder quotes.",
  };

  if (!input.viewerRole) {
    return guestCta;
  }

  if (input.viewerRole === "importer") {
    return {
      href: "/app/requests/new",
      label: "Post a shipment request",
      variant: "default",
      description:
        "Post your shipment request through the existing importer flow and receive private quotes on-platform.",
    } satisfies ForwarderProfileCta;
  }

  if (input.viewerRole === "forwarder") {
    return {
      href: "/app/forwarder/requests",
      label: "View open requests",
      variant: "outline",
      description:
        "This profile is read-only. Browse open shipment requests through the existing forwarder workspace.",
    } satisfies ForwarderProfileCta;
  }

  return guestCta;
}

export function formatForwarderShippingModes(value: string | null) {
  if (value === "both") {
    return "Sea and air";
  }

  if (value === "sea") {
    return "Sea freight";
  }

  if (value === "air") {
    return "Air freight";
  }

  return "Shipping modes not listed yet";
}
