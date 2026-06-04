import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import {
  psgcBarangays,
  psgcCitiesMunicipalities,
  psgcProvinces,
  psgcRegions,
} from "@/db/schema";

const defaultLimit = 50;

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

export type LocationFilters = {
  q?: string | null;
  regionCode?: string | null;
  provinceCode?: string | null;
  cityMunicipalityCode?: string | null;
  limit?: number;
};

function cleanSearch(value?: string | null) {
  return value?.trim() || undefined;
}

function boundedLimit(value?: number) {
  if (!value || !Number.isFinite(value)) {
    return defaultLimit;
  }

  return Math.min(Math.max(Math.floor(value), 1), 100);
}

function searchCondition(column: SQL.Aliased | SQL | Parameters<typeof ilike>[0], q?: string | null) {
  const query = cleanSearch(q);
  return query ? ilike(column, `%${query}%`) : undefined;
}

export async function listRegions(filters: LocationFilters = {}) {
  const conditions = [searchCondition(psgcRegions.name, filters.q)].filter(
    Boolean,
  ) as SQL[];

  return db
    .select({
      code: psgcRegions.code,
      name: psgcRegions.name,
      regionCode: psgcRegions.code,
      regionName: psgcRegions.name,
    })
    .from(psgcRegions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(psgcRegions.name))
    .limit(boundedLimit(filters.limit));
}

export async function listProvinces(filters: LocationFilters = {}) {
  const conditions = [
    filters.regionCode ? eq(psgcProvinces.regionCode, filters.regionCode) : undefined,
    searchCondition(psgcProvinces.name, filters.q),
  ].filter(Boolean) as SQL[];

  return db
    .select({
      code: psgcProvinces.code,
      name: psgcProvinces.name,
      regionCode: psgcProvinces.regionCode,
      regionName: psgcRegions.name,
      provinceCode: psgcProvinces.code,
      provinceName: psgcProvinces.name,
    })
    .from(psgcProvinces)
    .innerJoin(psgcRegions, eq(psgcProvinces.regionCode, psgcRegions.code))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(psgcProvinces.name))
    .limit(boundedLimit(filters.limit));
}

export async function listCitiesMunicipalities(filters: LocationFilters = {}) {
  const conditions = [
    filters.regionCode
      ? eq(psgcCitiesMunicipalities.regionCode, filters.regionCode)
      : undefined,
    filters.provinceCode
      ? eq(psgcCitiesMunicipalities.provinceCode, filters.provinceCode)
      : undefined,
    searchCondition(psgcCitiesMunicipalities.name, filters.q),
  ].filter(Boolean) as SQL[];

  return db
    .select({
      code: psgcCitiesMunicipalities.code,
      name: psgcCitiesMunicipalities.name,
      regionCode: psgcCitiesMunicipalities.regionCode,
      regionName: psgcRegions.name,
      provinceCode: psgcCitiesMunicipalities.provinceCode,
      provinceName: psgcProvinces.name,
      cityMunicipalityCode: psgcCitiesMunicipalities.code,
      cityMunicipalityName: psgcCitiesMunicipalities.name,
    })
    .from(psgcCitiesMunicipalities)
    .innerJoin(
      psgcRegions,
      eq(psgcCitiesMunicipalities.regionCode, psgcRegions.code),
    )
    .leftJoin(
      psgcProvinces,
      eq(psgcCitiesMunicipalities.provinceCode, psgcProvinces.code),
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(psgcCitiesMunicipalities.name))
    .limit(boundedLimit(filters.limit));
}

export async function listBarangays(filters: LocationFilters = {}) {
  if (!filters.cityMunicipalityCode) {
    return [];
  }

  const conditions = [
    eq(psgcBarangays.cityMunicipalityCode, filters.cityMunicipalityCode),
    searchCondition(psgcBarangays.name, filters.q),
  ].filter(Boolean) as SQL[];

  return db
    .select({
      code: psgcBarangays.code,
      name: psgcBarangays.name,
      regionCode: psgcBarangays.regionCode,
      regionName: psgcRegions.name,
      provinceCode: psgcBarangays.provinceCode,
      provinceName: psgcProvinces.name,
      cityMunicipalityCode: psgcBarangays.cityMunicipalityCode,
      cityMunicipalityName: psgcCitiesMunicipalities.name,
    })
    .from(psgcBarangays)
    .innerJoin(psgcRegions, eq(psgcBarangays.regionCode, psgcRegions.code))
    .innerJoin(
      psgcCitiesMunicipalities,
      eq(psgcBarangays.cityMunicipalityCode, psgcCitiesMunicipalities.code),
    )
    .leftJoin(psgcProvinces, eq(psgcBarangays.provinceCode, psgcProvinces.code))
    .where(and(...conditions))
    .orderBy(asc(psgcBarangays.name))
    .limit(boundedLimit(filters.limit));
}

export async function searchLocations(filters: LocationFilters = {}) {
  const query = cleanSearch(filters.q);

  if (!query) {
    return [];
  }

  return db
    .select({
      code: psgcCitiesMunicipalities.code,
      name: psgcCitiesMunicipalities.name,
      regionCode: psgcCitiesMunicipalities.regionCode,
      regionName: psgcRegions.name,
      provinceCode: psgcCitiesMunicipalities.provinceCode,
      provinceName: psgcProvinces.name,
      cityMunicipalityCode: psgcCitiesMunicipalities.code,
      cityMunicipalityName: psgcCitiesMunicipalities.name,
    })
    .from(psgcCitiesMunicipalities)
    .innerJoin(
      psgcRegions,
      eq(psgcCitiesMunicipalities.regionCode, psgcRegions.code),
    )
    .leftJoin(
      psgcProvinces,
      eq(psgcCitiesMunicipalities.provinceCode, psgcProvinces.code),
    )
    .where(
      or(
        ilike(psgcCitiesMunicipalities.name, `%${query}%`),
        ilike(psgcProvinces.name, `%${query}%`),
        ilike(psgcRegions.name, `%${query}%`),
      ),
    )
    .orderBy(asc(psgcCitiesMunicipalities.name))
    .limit(boundedLimit(filters.limit));
}
