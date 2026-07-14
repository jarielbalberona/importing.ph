import { listBarangays } from "@/lib/locations";
import { enforceLocationRateLimit, filtersFromRequest, locationsResponse } from "../route-utils";

export async function GET(request: Request) {
  const limited = await enforceLocationRateLimit(request);
  if (limited) return limited;
  const items = await listBarangays(filtersFromRequest(request));
  return locationsResponse(items);
}
