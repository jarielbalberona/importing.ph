import { NextResponse } from "next/server";

import type { LocationFilters, LocationOption } from "@/lib/locations";

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
