import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  forwarderCompanies,
  forwarderMembers,
  importerProfiles,
  quotes,
  shipmentRequests,
  userProfiles,
  type UserRole,
} from "@/db/schema";
import { requireRole } from "@/lib/authz";

export async function requireAdmin() {
  return requireRole(["admin"] satisfies UserRole[]);
}

export async function getAdminOverview() {
  await requireAdmin();

  const [users, requests, quoteRows] = await Promise.all([
    getAdminUsers(),
    getAdminRequests(),
    getAdminQuotes(),
  ]);

  return { users, requests, quotes: quoteRows };
}

async function getAdminUsers() {
  return db
    .select({
      id: userProfiles.id,
      role: userProfiles.role,
      fullName: userProfiles.fullName,
      clerkUserId: userProfiles.clerkUserId,
      importerCompanyName: importerProfiles.companyName,
      forwarderCompanyName: forwarderCompanies.name,
      forwarderCompanyId: forwarderCompanies.id,
      forwarderCompanyIsSuspended: forwarderCompanies.isSuspended,
      forwarderCompanySuspendedReason: forwarderCompanies.suspendedReason,
      createdAt: userProfiles.createdAt,
    })
    .from(userProfiles)
    .leftJoin(importerProfiles, eq(importerProfiles.userProfileId, userProfiles.id))
    .leftJoin(forwarderMembers, eq(forwarderMembers.userProfileId, userProfiles.id))
    .leftJoin(
      forwarderCompanies,
      eq(forwarderCompanies.id, forwarderMembers.forwarderCompanyId),
    )
    .orderBy(desc(userProfiles.createdAt));
}

export async function suspendForwarderCompanyForCurrentAdmin(input: {
  forwarderCompanyId: string;
  reason: string;
}) {
  const admin = await requireAdmin();
  const now = new Date();

  const [company] = await db
    .update(forwarderCompanies)
    .set({
      isSuspended: true,
      suspendedAt: now,
      suspendedReason: input.reason,
      suspendedByUserProfileId: admin.id,
      updatedAt: now,
    })
    .where(eq(forwarderCompanies.id, input.forwarderCompanyId))
    .returning({ id: forwarderCompanies.id });

  return company;
}

export async function unsuspendForwarderCompanyForCurrentAdmin(
  forwarderCompanyId: string,
) {
  await requireAdmin();
  const now = new Date();

  const [company] = await db
    .update(forwarderCompanies)
    .set({
      isSuspended: false,
      suspendedAt: null,
      suspendedReason: null,
      suspendedByUserProfileId: null,
      updatedAt: now,
    })
    .where(eq(forwarderCompanies.id, forwarderCompanyId))
    .returning({ id: forwarderCompanies.id });

  return company;
}

async function getAdminRequests() {
  return db
    .select({
      id: shipmentRequests.id,
      status: shipmentRequests.status,
      cargoDescription: shipmentRequests.cargoDescription,
      origin: shipmentRequests.origin,
      destination: shipmentRequests.destination,
      cargoType: shipmentRequests.cargoType,
      importerCompanyName: importerProfiles.companyName,
      importerUserName: userProfiles.fullName,
      createdAt: shipmentRequests.createdAt,
    })
    .from(shipmentRequests)
    .innerJoin(
      importerProfiles,
      eq(shipmentRequests.importerProfileId, importerProfiles.id),
    )
    .innerJoin(userProfiles, eq(importerProfiles.userProfileId, userProfiles.id))
    .orderBy(desc(shipmentRequests.createdAt));
}

async function getAdminQuotes() {
  return db
    .select({
      id: quotes.id,
      status: quotes.status,
      amount: quotes.quoteAmount,
      currency: quotes.currency,
      serviceOffered: quotes.serviceOffered,
      requestId: shipmentRequests.id,
      cargoDescription: shipmentRequests.cargoDescription,
      forwarderCompanyName: forwarderCompanies.name,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .innerJoin(
      shipmentRequests,
      eq(quotes.shipmentRequestId, shipmentRequests.id),
    )
    .innerJoin(
      forwarderCompanies,
      eq(quotes.forwarderCompanyId, forwarderCompanies.id),
    )
    .orderBy(desc(quotes.createdAt));
}
