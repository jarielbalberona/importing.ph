import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ForwarderCompanyProfilePage } from "@/components/public/forwarder-company-profile-page";
import { PublicSiteHeader } from "@/components/public/site-header";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import {
  buildForwarderCompanyProfileMetadata,
  resolveForwarderProfileCta,
} from "@/lib/forwarder-profile-page";
import { getForwarderCompanyProfileBySlug } from "@/lib/profile-route-queries";

type ForwarderProfilePageProps = {
  params: Promise<{
    companySlug: string;
  }>;
};

async function getViewerRole() {
  const { userId } = await auth();

  if (!userId) {
    return undefined;
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkUserId, userId),
  });

  return profile?.role;
}

export async function generateMetadata({
  params,
}: ForwarderProfilePageProps): Promise<Metadata> {
  const { companySlug } = await params;
  const profile = await getForwarderCompanyProfileBySlug(companySlug);

  if (!profile) {
    return {};
  }

  return buildForwarderCompanyProfileMetadata(profile);
}

export default async function ForwarderProfilePage({
  params,
}: ForwarderProfilePageProps) {
  const { companySlug } = await params;
  const profile = await getForwarderCompanyProfileBySlug(companySlug);

  if (!profile) {
    notFound();
  }

  const viewerRole = await getViewerRole();
  const cta = resolveForwarderProfileCta({
    companySlug: profile.slug,
    viewerRole,
  });

  return (
    <>
      <PublicSiteHeader />
      <ForwarderCompanyProfilePage profile={profile} cta={cta} />
    </>
  );
}
