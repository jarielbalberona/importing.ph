import { searchLocations } from "@/lib/locations";
import { filtersFromRequest, locationsResponse } from "../route-utils";

export async function GET(request: Request) {
  const items = await searchLocations(filtersFromRequest(request));
  return locationsResponse(items);
}
