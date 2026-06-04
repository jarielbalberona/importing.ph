import { readFile } from "node:fs/promises";
import path from "node:path";

import { sql } from "drizzle-orm";

import { db, closeDb } from "@/db";
import {
  psgcBarangays,
  psgcCitiesMunicipalities,
  psgcProvinces,
  psgcRegions,
} from "@/db/schema";

const defaultDataDir = path.join(process.cwd(), "data", "psgc");
const version = process.env.PSGC_VERSION || "2025-2Q";
const batchSize = 1000;
const ncrRegionCode = "1300000000";

type RawLocation = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function code(value: unknown) {
  return text(value);
}

function numericCode(value: unknown, length: number) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return String(value).padStart(length, "0");
  }

  const raw = text(value);

  if (!/^\d+$/.test(raw)) {
    return "";
  }

  return raw.padStart(length, "0");
}

function name(row: RawLocation) {
  return (
    text(row.name) ||
    text(row.area_name) ||
    text(row.regionName) ||
    text(row.provName) ||
    text(row.munCityName) ||
    text(row.brgyName)
  );
}

function psgcCode(row: RawLocation) {
  return code(row.code) || code(row.psgc_code) || code(row.psgcCode);
}

function regionCode(row: RawLocation) {
  const explicit =
    code(row.regionCode) ||
    code(row.region_code) ||
    code(row.reg_code);

  if (explicit) {
    return explicit;
  }

  const reg = numericCode(row.reg ?? row.regCode, 2);
  return reg ? `${reg}00000000` : "";
}

function provinceCode(row: RawLocation) {
  const explicit =
    code(row.provinceCode) ||
    code(row.province_code) ||
    code(row.prv_code);

  if (explicit) {
    return explicit;
  }

  const reg = numericCode(row.reg ?? row.regCode, 2);
  const prv = numericCode(row.prv ?? row.provCode, 3);

  if (!reg || !prv || prv === "000" || `${reg}00000000` === ncrRegionCode) {
    return undefined;
  }

  return `${reg}${prv}00000`;
}

function cityMunicipalityCode(row: RawLocation) {
  const explicit =
    code(row.cityMunicipalityCode) ||
    code(row.city_municipality_code) ||
    code(row.city_code) ||
    code(row.municipality_code);

  if (explicit) {
    return explicit;
  }

  const psgc = psgcCode(row);

  if (psgc) {
    if (psgc.endsWith("000")) {
      return psgc;
    }

    if (/^\d{10}$/.test(psgc)) {
      return `${psgc.slice(0, 7)}000`;
    }
  }

  const reg = numericCode(row.reg ?? row.regCode, 2);
  const prv = numericCode(row.prv ?? row.provCode, 3);
  const mun = numericCode(row.mun ?? row.munCityCode, 2);

  return reg && prv && mun ? `${reg}${prv}${mun}000` : "";
}

function cityMunicipalityPrimaryCode(row: RawLocation) {
  const psgc = psgcCode(row);

  if (/^\d{10}$/.test(psgc)) {
    return psgc;
  }

  const reg = numericCode(row.reg ?? row.regCode, 2);
  const prv = numericCode(row.prv ?? row.provCode, 3);

  if (reg && prv && prv !== "000") {
    return `${reg}${prv}00000`;
  }

  return psgc;
}

async function readJsonArray(filePath: string) {
  let raw: string;

  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(
        `Missing PSGC seed file: ${filePath}. Add regions.json, provinces.json, muncities.json, and barangays.json under data/psgc, or set PSGC_DATA_DIR.`,
      );
    }

    throw error;
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON array.`);
  }

  return parsed as RawLocation[];
}

async function importPsgc() {
  const dataDir = process.env.PSGC_DATA_DIR || defaultDataDir;
  const dryRun = process.argv.includes("--dry-run");
  const regions = await readJsonArray(path.join(dataDir, "regions.json"));
  const provinces = await readJsonArray(path.join(dataDir, "provinces.json"));
  const citiesMunicipalities = await readJsonArray(
    path.join(dataDir, "muncities.json"),
  );
  const barangays = await readJsonArray(path.join(dataDir, "barangays.json"));

  const normalizedRegions = regions.map((row) => ({
    code: psgcCode(row),
    name: name(row),
    geographicLevel: text(row.geographic_level) || "Reg",
    version,
  }));
  const normalizedProvinces = provinces.map((row) => ({
    code: psgcCode(row),
    name: name(row),
    regionCode: regionCode(row),
    geographicLevel: text(row.geographic_level) || "Prov",
    version,
  }));
  const normalizedCitiesMunicipalities = citiesMunicipalities.map((row) => ({
    code: cityMunicipalityPrimaryCode(row),
    name: name(row),
    regionCode: regionCode(row),
    provinceCode: provinceCode(row),
    geographicLevel: text(row.geographic_level) || text(row.type) || "Mun",
    version,
  }));
  const normalizedBarangays = barangays.map((row) => ({
    code: psgcCode(row),
    name: name(row),
    regionCode: regionCode(row),
    provinceCode: provinceCode(row),
    cityMunicipalityCode: cityMunicipalityCode(row),
    geographicLevel: text(row.geographic_level) || "Bgy",
    version,
  }));
  const provinceCodes = new Set(normalizedProvinces.map((row) => row.code));
  const derivedProvinceParents = new Map<
    string,
    (typeof normalizedProvinces)[number]
  >();

  for (const row of normalizedCitiesMunicipalities) {
    if (!row.provinceCode || provinceCodes.has(row.provinceCode)) {
      continue;
    }

    derivedProvinceParents.set(row.provinceCode, {
      code: row.provinceCode,
      name: row.name,
      regionCode: row.regionCode,
      geographicLevel: "HUC",
      version,
    });
  }

  normalizedProvinces.push(...derivedProvinceParents.values());

  const provinceNames = new Map(
    normalizedProvinces.map((row) => [row.code, row.name]),
  );
  const cityMunicipalityCodes = new Set(
    normalizedCitiesMunicipalities.map((row) => row.code),
  );
  const derivedCityMunicipalityParents = new Map<
    string,
    (typeof normalizedCitiesMunicipalities)[number]
  >();

  for (const row of normalizedBarangays) {
    if (
      !row.cityMunicipalityCode ||
      cityMunicipalityCodes.has(row.cityMunicipalityCode)
    ) {
      continue;
    }

    derivedCityMunicipalityParents.set(row.cityMunicipalityCode, {
      code: row.cityMunicipalityCode,
      name: provinceNames.get(row.cityMunicipalityCode) || row.name,
      regionCode: row.regionCode,
      provinceCode: row.provinceCode,
      geographicLevel: "HUC",
      version,
    });
  }

  normalizedCitiesMunicipalities.push(
    ...derivedCityMunicipalityParents.values(),
  );

  for (const [label, rawRows, rows] of [
    ["regions", regions, normalizedRegions],
    ["provinces", provinces, normalizedProvinces],
    ["muncities", citiesMunicipalities, normalizedCitiesMunicipalities],
    ["barangays", barangays, normalizedBarangays],
  ] as const) {
    const invalidIndex = rows.findIndex((row) =>
      Object.entries(row).some(([key, value]) => {
        if (key === "provinceCode") {
          return false;
        }

        return value === "";
      }),
    );

    if (invalidIndex >= 0) {
      throw new Error(
        `Invalid ${label} row at index ${invalidIndex}: normalized=${JSON.stringify(rows[invalidIndex])} raw=${JSON.stringify(rawRows[invalidIndex])}`,
      );
    }
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          version,
          regions: normalizedRegions.length,
          provinces: normalizedProvinces.length,
          citiesMunicipalities: normalizedCitiesMunicipalities.length,
          barangays: normalizedBarangays.length,
        },
        null,
        2,
      ),
    );
    return;
  }

  await db.transaction(async (tx) => {
    for (const rows of chunks(normalizedRegions)) {
      await tx.insert(psgcRegions).values(rows).onConflictDoUpdate({
        target: psgcRegions.code,
        set: {
          name: sql`excluded.name`,
          geographicLevel: sql`excluded.geographic_level`,
          version: sql`excluded.version`,
          updatedAt: sql`now()`,
        },
      });
    }

    for (const rows of chunks(normalizedProvinces)) {
      await tx.insert(psgcProvinces).values(rows).onConflictDoUpdate({
        target: psgcProvinces.code,
        set: {
          name: sql`excluded.name`,
          regionCode: sql`excluded.region_code`,
          geographicLevel: sql`excluded.geographic_level`,
          version: sql`excluded.version`,
          updatedAt: sql`now()`,
        },
      });
    }

    for (const rows of chunks(normalizedCitiesMunicipalities)) {
      await tx.insert(psgcCitiesMunicipalities).values(rows).onConflictDoUpdate({
        target: psgcCitiesMunicipalities.code,
        set: {
          name: sql`excluded.name`,
          regionCode: sql`excluded.region_code`,
          provinceCode: sql`excluded.province_code`,
          geographicLevel: sql`excluded.geographic_level`,
          version: sql`excluded.version`,
          updatedAt: sql`now()`,
        },
      });
    }

    for (const rows of chunks(normalizedBarangays)) {
      await tx.insert(psgcBarangays).values(rows).onConflictDoUpdate({
        target: psgcBarangays.code,
        set: {
          name: sql`excluded.name`,
          regionCode: sql`excluded.region_code`,
          provinceCode: sql`excluded.province_code`,
          cityMunicipalityCode: sql`excluded.city_municipality_code`,
          geographicLevel: sql`excluded.geographic_level`,
          version: sql`excluded.version`,
          updatedAt: sql`now()`,
        },
      });
    }
  });

  console.log(`Imported PSGC ${version}.`);
}

importPsgc()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void closeDb();
  });

function chunks<T>(items: T[]) {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    result.push(items.slice(index, index + batchSize));
  }

  return result;
}
