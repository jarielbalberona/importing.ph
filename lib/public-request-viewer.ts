import { and, eq } from "drizzle-orm";

import { db, type Database } from "@/db";
import {
  forwarderCompanies,
  forwarderMembers,
  quotes,
  type UserRole,
} from "@/db/schema";
import { getOptionalProfileForCurrentUser } from "@/lib/authz";

export type PublicRequestViewer =
  | { kind: "anonymous" }
  | { kind: "onboarding" }
  | { kind: "wrong_role"; role: "importer" | "admin" }
  | { kind: "forwarder_unavailable" }
  | { kind: "forwarder_suspended" }
  | { kind: "forwarder_eligible"; hasExistingQuote: boolean };

type PublicRequestViewerDatabase = Pick<Database, "select">;
type OptionalViewerProfile = { id: string; role: UserRole } | null;

export async function getPublicRequestViewer(
  requestId: string,
): Promise<PublicRequestViewer> {
  const { profile, userId } = await getOptionalProfileForCurrentUser();

  return resolvePublicRequestViewer(db, {
    requestId,
    userId,
    profile,
  });
}

export async function resolvePublicRequestViewer(
  database: PublicRequestViewerDatabase,
  input: {
    requestId: string;
    userId: string | null;
    profile: OptionalViewerProfile;
  },
): Promise<PublicRequestViewer> {
  const { profile, userId } = input;

  if (!userId) return { kind: "anonymous" };
  if (!profile) return { kind: "onboarding" };
  if (profile.role !== "forwarder") {
    return { kind: "wrong_role", role: profile.role };
  }

  const [member] = await database
    .select({
      companyId: forwarderMembers.forwarderCompanyId,
      companyIsSuspended: forwarderCompanies.isSuspended,
    })
    .from(forwarderMembers)
    .innerJoin(
      forwarderCompanies,
      eq(forwarderCompanies.id, forwarderMembers.forwarderCompanyId),
    )
    .where(eq(forwarderMembers.userProfileId, profile.id))
    .limit(1);

  if (!member) return { kind: "forwarder_unavailable" };
  if (member.companyIsSuspended) return { kind: "forwarder_suspended" };

  const [existingQuote] = await database
    .select({ id: quotes.id })
    .from(quotes)
    .where(
      and(
        eq(quotes.shipmentRequestId, input.requestId),
        eq(quotes.forwarderCompanyId, member.companyId),
      ),
    )
    .limit(1);

  return {
    kind: "forwarder_eligible",
    hasExistingQuote: Boolean(existingQuote),
  };
}
