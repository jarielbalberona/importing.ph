import { NextResponse } from "next/server";
import { isIP } from "node:net";

import type { LocationFilters, LocationOption } from "@/lib/locations";
import { rateLimitResponse } from "@/lib/api-response";
import {
  consumeRateLimit,
  RateLimitError,
  rateLimitPolicies,
} from "@/lib/rate-limit";

export function filtersFromRequest(request: Request): LocationFilters {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit"));

  return {
    q: url.searchParams.get("q"),
    regionCode: url.searchParams.get("regionCode"),
    provinceCode: url.searchParams.get("provinceCode"),
    cityMunicipalityCode: url.searchParams.get("cityMunicipalityCode"),
    limit: Number.isFinite(limit) ? limit : undefined,
  };
}

export function locationsResponse(items: LocationOption[]) {
  return NextResponse.json({ items });
}

export async function enforceLocationRateLimit(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const subject = normalizeClientIp(
    forwardedFor || request.headers.get("x-real-ip") || "unknown",
  );

  try {
    await consumeRateLimit(rateLimitPolicies.locationLookup, subject);
    return null;
  } catch (error) {
    if (error instanceof RateLimitError) {
      return rateLimitResponse(error);
    }
    throw error;
  }
}

export function normalizeClientIp(raw: string) {
  let value = raw.trim().toLowerCase();
  const bracketed = value.match(/^\[([^\]]+)](?::\d+)?$/);
  if (bracketed) value = bracketed[1];

  const ipv4WithPort = value.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) value = ipv4WithPort[1];

  const mappedIpv4 = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mappedIpv4 && isIP(mappedIpv4[1]) === 4) value = mappedIpv4[1];

  return isIP(value) ? value : "unknown";
}
