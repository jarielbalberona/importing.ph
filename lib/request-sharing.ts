import { randomBytes } from "node:crypto";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { db, type Database } from "@/db";
import { shipmentRequests } from "@/db/schema";
import { consumeRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { publicShareTokenSchema } from "@/lib/public-request-links";
import { logServerError } from "@/lib/server-log";
import { requireImporterProfile } from "@/lib/shipment-requests";

export const publicSummarySchema = z
  .string()
  .trim()
  .min(10, "Write at least 10 characters for the public summary.")
  .max(280, "Keep the public summary within 280 characters.");

export class RequestShareError extends Error {
  constructor(
    readonly code:
      | "invalid_summary"
      | "not_found"
      | "not_posted"
      | "not_shared"
      | "token_generation_failed",
  ) {
    super(code);
  }
}

type RequestShareDatabase = Pick<Database, "transaction">;
type PublicRequestDatabase = Pick<Database, "select">;
type TokenGenerator = () => string;

export type PublicShipmentRequest = {
  publicSummary: string;
  cargoType: string;
  origin: string;
  destinationCity: string | null;
  destinationProvince: string | null;
  deliveryPreference: string;
  shippingMode: string;
  shippingPriority: string;
  totalCbm: string | null;
  totalWeightKg: string | null;
  packageCount: number | null;
  postedAt: Date;
  isAcceptingQuotes: boolean;
};

export type PublicShipmentRequestRecord = {
  requestId: string;
  request: PublicShipmentRequest;
};

export function generatePublicShareToken() {
  return randomBytes(12).toString("base64url");
}

function parsePublicSummary(input: unknown) {
  const parsed = publicSummarySchema.safeParse(input);
  if (!parsed.success) throw new RequestShareError("invalid_summary");
  return parsed.data;
}

function validGeneratedToken(generateToken: TokenGenerator) {
  const token = generateToken();
  if (!publicShareTokenSchema.safeParse(token).success) {
    throw new RequestShareError("token_generation_failed");
  }
  return token;
}

export async function enableRequestSharingForImporter(
  database: RequestShareDatabase,
  input: {
    requestId: string;
    importerProfileId: string;
    publicSummary: unknown;
    now?: Date;
    generateToken?: TokenGenerator;
  },
) {
  const publicSummary = parsePublicSummary(input.publicSummary);
  const generateToken = input.generateToken ?? generatePublicShareToken;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = validGeneratedToken(generateToken);
    try {
      return await database.transaction(async (tx) => {
        const [request] = await tx
          .select({
            id: shipmentRequests.id,
            status: shipmentRequests.status,
            publicShareToken: shipmentRequests.publicShareToken,
          })
          .from(shipmentRequests)
          .where(
            and(
              eq(shipmentRequests.id, input.requestId),
              eq(
                shipmentRequests.importerProfileId,
                input.importerProfileId,
              ),
            ),
          )
          .for("update")
          .limit(1);

        if (!request) throw new RequestShareError("not_found");
        if (request.status !== "posted") {
          throw new RequestShareError("not_posted");
        }

        const now = input.now ?? new Date();
        const token = request.publicShareToken ?? candidate;
        const [updated] = await tx
          .update(shipmentRequests)
          .set({
            publicShareToken: token,
            publicSummary,
            publicSharedAt: request.publicShareToken ? undefined : now,
            updatedAt: now,
          })
          .where(eq(shipmentRequests.id, request.id))
          .returning({
            requestId: shipmentRequests.id,
            publicShareToken: shipmentRequests.publicShareToken,
            publicSummary: shipmentRequests.publicSummary,
            publicSharedAt: shipmentRequests.publicSharedAt,
          });

        return updated;
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  logServerError(
    "request_share.token_generation_failed",
    new Error("Unique public request token generation failed."),
    { requestId: input.requestId },
  );
  throw new RequestShareError("token_generation_failed");
}

export async function rotateRequestShareLinkForImporter(
  database: RequestShareDatabase,
  input: {
    requestId: string;
    importerProfileId: string;
    now?: Date;
    generateToken?: TokenGenerator;
  },
) {
  const generateToken = input.generateToken ?? generatePublicShareToken;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = validGeneratedToken(generateToken);
    try {
      return await database.transaction(async (tx) => {
        const [request] = await tx
          .select({
            id: shipmentRequests.id,
            status: shipmentRequests.status,
            publicShareToken: shipmentRequests.publicShareToken,
          })
          .from(shipmentRequests)
          .where(
            and(
              eq(shipmentRequests.id, input.requestId),
              eq(
                shipmentRequests.importerProfileId,
                input.importerProfileId,
              ),
            ),
          )
          .for("update")
          .limit(1);

        if (!request) throw new RequestShareError("not_found");
        if (request.status !== "posted") {
          throw new RequestShareError("not_posted");
        }
        if (!request.publicShareToken) {
          throw new RequestShareError("not_shared");
        }

        const now = input.now ?? new Date();
        const [updated] = await tx
          .update(shipmentRequests)
          .set({
            publicShareToken: candidate,
            publicSharedAt: now,
            updatedAt: now,
          })
          .where(eq(shipmentRequests.id, request.id))
          .returning({
            requestId: shipmentRequests.id,
            publicShareToken: shipmentRequests.publicShareToken,
          });
        return updated;
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  logServerError(
    "request_share.token_generation_failed",
    new Error("Unique public request token rotation failed."),
    { requestId: input.requestId },
  );
  throw new RequestShareError("token_generation_failed");
}

export async function disableRequestSharingForImporter(
  database: RequestShareDatabase,
  input: { requestId: string; importerProfileId: string; now?: Date },
) {
  return database.transaction(async (tx) => {
    const [request] = await tx
      .select({
        id: shipmentRequests.id,
        publicShareToken: shipmentRequests.publicShareToken,
      })
      .from(shipmentRequests)
      .where(
        and(
          eq(shipmentRequests.id, input.requestId),
          eq(shipmentRequests.importerProfileId, input.importerProfileId),
        ),
      )
      .for("update")
      .limit(1);

    if (!request) throw new RequestShareError("not_found");
    if (!request.publicShareToken) throw new RequestShareError("not_shared");

    const [updated] = await tx
      .update(shipmentRequests)
      .set({ publicShareToken: null, updatedAt: input.now ?? new Date() })
      .where(eq(shipmentRequests.id, request.id))
      .returning({ requestId: shipmentRequests.id });
    return updated;
  });
}

export async function enableRequestSharingForCurrentImporter(input: {
  requestId: string;
  publicSummary: unknown;
}) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.requestMutation, profile.id);
  return enableRequestSharingForImporter(db, {
    ...input,
    importerProfileId: importerProfile.id,
  });
}

export async function rotateRequestShareLinkForCurrentImporter(requestId: string) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.requestMutation, profile.id);
  return rotateRequestShareLinkForImporter(db, {
    requestId,
    importerProfileId: importerProfile.id,
  });
}

export async function disableRequestSharingForCurrentImporter(requestId: string) {
  const { profile, importerProfile } = await requireImporterProfile();
  await consumeRateLimit(rateLimitPolicies.requestMutation, profile.id);
  return disableRequestSharingForImporter(db, {
    requestId,
    importerProfileId: importerProfile.id,
  });
}

export async function findPublicShipmentRequestByToken(
  database: PublicRequestDatabase,
  token: string,
): Promise<PublicShipmentRequestRecord | null> {
  if (!publicShareTokenSchema.safeParse(token).success) return null;

  const [record] = await database
    .select({
      requestId: shipmentRequests.id,
      status: shipmentRequests.status,
      publicSummary: shipmentRequests.publicSummary,
      cargoType: shipmentRequests.cargoType,
      origin: shipmentRequests.origin,
      destinationCity: shipmentRequests.destinationCityMunicipalityName,
      destinationProvince: shipmentRequests.destinationProvinceName,
      deliveryPreference: shipmentRequests.deliveryPreference,
      shippingMode: shipmentRequests.shippingModePreference,
      shippingPriority: shipmentRequests.shippingPreference,
      totalCbm: shipmentRequests.totalCbm,
      totalWeightKg: shipmentRequests.totalWeightKg,
      packageCount: shipmentRequests.packageCount,
      postedAt: shipmentRequests.createdAt,
    })
    .from(shipmentRequests)
    .where(
      and(
        eq(shipmentRequests.publicShareToken, token),
        ne(shipmentRequests.status, "draft"),
      ),
    )
    .limit(1);

  if (!record?.publicSummary) return null;

  return {
    requestId: record.requestId,
    request: {
      publicSummary: record.publicSummary,
      cargoType: record.cargoType,
      origin: record.origin,
      destinationCity: record.destinationCity,
      destinationProvince: record.destinationProvince,
      deliveryPreference: record.deliveryPreference,
      shippingMode: record.shippingMode,
      shippingPriority: record.shippingPriority,
      totalCbm: record.totalCbm,
      totalWeightKg: record.totalWeightKg,
      packageCount: record.packageCount,
      postedAt: record.postedAt,
      isAcceptingQuotes: record.status === "posted",
    },
  };
}

export async function getPublicShipmentRequestByToken(token: string) {
  return findPublicShipmentRequestByToken(db, token);
}

function isUniqueViolation(error: unknown) {
  let current = error;
  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== "object" || current === null) return false;
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}
