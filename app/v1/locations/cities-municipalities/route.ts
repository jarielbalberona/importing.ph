import { listCitiesMunicipalities } from "@/lib/locations";
import { filtersFromRequest, locationsResponse } from "../route-utils";

export async function GET(request: Request) {
  const items = await listCitiesMunicipalities(filtersFromRequest(request));
  return locationsResponse(items);
}
