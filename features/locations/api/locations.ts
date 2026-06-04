export type LocationOption = {
  code: string;
  name: string;
  regionCode?: string | null;
  regionName?: string | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  cityMunicipalityCode?: string | null;
  cityMunicipalityName?: string | null;
};

type LocationListResponse = {
  items: LocationOption[];
};

type LocationQuery = {
  q?: string;
  regionCode?: string;
  provinceCode?: string;
  cityMunicipalityCode?: string;
};

function queryString(query: LocationQuery = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  const text = params.toString();
  return text ? `?${text}` : "";
}

async function getLocations(path: string, query?: LocationQuery) {
  const response = await fetch(`${path}${queryString(query)}`);

  if (!response.ok) {
    throw new Error("Could not load locations.");
  }

  const payload = (await response.json()) as LocationListResponse;
  return payload.items;
}

export function getRegions(query?: Pick<LocationQuery, "q">) {
  return getLocations("/v1/locations/regions", query);
}

export function getProvinces(query?: Pick<LocationQuery, "q" | "regionCode">) {
  return getLocations("/v1/locations/provinces", query);
}

export function getCitiesMunicipalities(
  query?: Pick<LocationQuery, "q" | "regionCode" | "provinceCode">,
) {
  return getLocations("/v1/locations/cities-municipalities", query);
}

export function getBarangays(
  query: Pick<LocationQuery, "cityMunicipalityCode"> &
    Pick<LocationQuery, "q" | "provinceCode">,
) {
  return getLocations("/v1/locations/barangays", query);
}

export function searchLocations(query: Pick<LocationQuery, "q">) {
  return getLocations("/v1/locations/search", query);
}
