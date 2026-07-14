import { searchLocations } from "@/lib/locations";
import { enforceLocationRateLimit, filtersFromRequest, locationsResponse } from "../route-utils";

export async function GET(request: Request) {
  const limited = await enforceLocationRateLimit(request);
  if (limited) return limited;
  const items = await searchLocations(filtersFromRequest(request));
  return locationsResponse(items);
}
