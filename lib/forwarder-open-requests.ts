import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import {
  type CargoType,
  cargoTypeEnum,
  type DeliveryPreference,
  deliveryPreferenceEnum,
  forwarderCompanies,
  forwarderMembers,
  quotes,
  shipmentRequests,
  type ShippingPreference,
  shippingPreferenceEnum,
  type UserRole,
} from "@/db/schema";
import { requireRole } from "@/lib/authz";

export type ForwarderSafeRequest = {
  id: string;
  status: string;
  cargoDescription: string;
  cargoType: string;
  totalCbm: string | null;
  totalWeightKg: string | null;
  packageCount: number | null;
  lengthCm: string | null;
  widthCm: string | null;
  heightCm: string | null;
  declaredValue: string | null;
  origin: string;
  destination: string;
  deliveryPreference: string;
  shippingPreference: string;
  notes: string | null;
  attachmentNotes: string | null;
  createdAt: Date;
};

export type OpenRequestFilters = {
  origin?: string;
  destination?: string;
  cargoType?: CargoType;
  deliveryPreference?: DeliveryPreference;
  shippingPreference?: ShippingPreference;
  specialHandling?: "msds";
};

const forwarderSafeRequestColumns = {
  id: shipmentRequests.id,
  status: shipmentRequests.status,
  cargoDescription: shipmentRequests.cargoDescription,
  cargoType: shipmentRequests.cargoType,
  totalCbm: shipmentRequests.totalCbm,
  totalWeightKg: shipmentRequests.totalWeightKg,
  packageCount: shipmentRequests.packageCount,
  lengthCm: shipmentRequests.lengthCm,
  widthCm: shipmentRequests.widthCm,
  heightCm: shipmentRequests.heightCm,
  declaredValue: shipmentRequests.declaredValue,
  origin: shipmentRequests.origin,
  destination: shipmentRequests.destination,
  deliveryPreference: shipmentRequests.deliveryPreference,
  shippingPreference: shipmentRequests.shippingPreference,
  notes: shipmentRequests.notes,
  attachmentNotes: shipmentRequests.attachmentNotes,
  createdAt: shipmentRequests.createdAt,
};

export async function requireForwarderMember() {
  const profile = await requireRole(["forwarder"] satisfies UserRole[]);

  const member = await db
    .select({
      id: forwarderMembers.id,
      companyId: forwarderMembers.forwarderCompanyId,
      companyName: forwarderCompanies.name,
      companyIsSuspended: forwarderCompanies.isSuspended,
      memberRole: forwarderMembers.memberRole,
    })
    .from(forwarderMembers)
    .innerJoin(
      forwarderCompanies,
      eq(forwarderMembers.forwarderCompanyId, forwarderCompanies.id),
    )
    .where(eq(forwarderMembers.userProfileId, profile.id))
    .limit(1);

  if (!member[0]) {
    throw new Error("Forwarder membership is missing for the current user.");
  }

  return { profile, member: member[0] };
}

function parseEnumValue<T extends readonly string[]>(
  values: T,
  value: string | undefined,
) {
  if (!value) {
    return undefined;
  }

  return values.includes(value) ? (value as T[number]) : undefined;
}

export function openRequestFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): OpenRequestFilters {
  const firstValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const specialHandling = firstValue("specialHandling");

  return {
    origin: firstValue("origin")?.trim() || undefined,
    destination: firstValue("destination")?.trim() || undefined,
    cargoType: parseEnumValue(cargoTypeEnum.enumValues, firstValue("cargoType")),
    deliveryPreference: parseEnumValue(
      deliveryPreferenceEnum.enumValues,
      firstValue("deliveryPreference"),
    ),
    shippingPreference: parseEnumValue(
      shippingPreferenceEnum.enumValues,
      firstValue("shippingPreference"),
    ),
    specialHandling: specialHandling === "msds" ? "msds" : undefined,
  };
}

function whereForOpenRequestFilters(filters: OpenRequestFilters) {
  const conditions: SQL[] = [eq(shipmentRequests.status, "posted")];

  if (filters.origin) {
    conditions.push(ilike(shipmentRequests.origin, `%${filters.origin}%`));
  }

  if (filters.destination) {
    conditions.push(
      ilike(shipmentRequests.destination, `%${filters.destination}%`),
    );
  }

  if (filters.cargoType) {
    conditions.push(eq(shipmentRequests.cargoType, filters.cargoType));
  }

  if (filters.deliveryPreference) {
    conditions.push(
      eq(shipmentRequests.deliveryPreference, filters.deliveryPreference),
    );
  }

  if (filters.shippingPreference) {
    conditions.push(
      eq(shipmentRequests.shippingPreference, filters.shippingPreference),
    );
  }

  if (filters.specialHandling === "msds") {
    conditions.push(
      or(
        ilike(shipmentRequests.notes, "%msds%"),
        ilike(shipmentRequests.attachmentNotes, "%msds%"),
      )!,
    );
  }

  return and(...conditions);
}

export async function getOpenShipmentRequestsForForwarder(
  filters: OpenRequestFilters = {},
) {
  await requireForwarderMember();

  return db
    .select(forwarderSafeRequestColumns)
    .from(shipmentRequests)
    .where(whereForOpenRequestFilters(filters))
    .orderBy(desc(shipmentRequests.createdAt));
}

export async function getOpenShipmentRequestForForwarder(requestId: string) {
  await requireForwarderMember();

  const [request] = await db
    .select(forwarderSafeRequestColumns)
    .from(shipmentRequests)
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.status, "posted"),
      ),
    )
    .limit(1);

  return request;
}

export async function getShipmentRequestForForwarderDetail(
  requestId: string,
  forwarderCompanyId: string,
) {
  const [postedRequest] = await db
    .select(forwarderSafeRequestColumns)
    .from(shipmentRequests)
    .where(
      and(
        eq(shipmentRequests.id, requestId),
        eq(shipmentRequests.status, "posted"),
      ),
    )
    .limit(1);

  if (postedRequest) {
    return postedRequest;
  }

  const [ownQuote] = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(
      and(
        eq(quotes.shipmentRequestId, requestId),
        eq(quotes.forwarderCompanyId, forwarderCompanyId),
      ),
    )
    .limit(1);

  if (!ownQuote) {
    return undefined;
  }

  const [request] = await db
    .select(forwarderSafeRequestColumns)
    .from(shipmentRequests)
    .where(eq(shipmentRequests.id, requestId))
    .limit(1);

  return request;
}
