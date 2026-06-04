import { listProvinces } from "@/lib/locations";
import { filtersFromRequest, locationsResponse } from "../route-utils";

export async function GET(request: Request) {
  const items = await listProvinces(filtersFromRequest(request));
  return locationsResponse(items);
}
