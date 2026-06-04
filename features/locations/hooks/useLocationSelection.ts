"use client";

import { useEffect, useState } from "react";

import type { LocationOption } from "@/features/locations/api/locations";
import {
  getBarangays,
  getCitiesMunicipalities,
  getRegions,
  getProvinces,
} from "@/features/locations/api/locations";

export function useLocationSelection(input: {
  regionCode?: string;
  provinceCode?: string;
  cityMunicipalityCode?: string;
}) {
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<LocationOption[]>([]);
  const [barangays, setBarangays] = useState<LocationOption[]>([]);

  useEffect(() => {
    let active = true;

    getRegions()
      .then((items) => {
        if (active) {
          setRegions(items);
        }
      })
      .catch(() => {
        if (active) {
          setRegions([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!input.regionCode) {
      queueMicrotask(() => {
        if (active) {
          setProvinces([]);
        }
      });
      return;
    }

    getProvinces({ regionCode: input.regionCode })
      .then((items) => {
        if (active) {
          setProvinces(items);
        }
      })
      .catch(() => {
        if (active) {
          setProvinces([]);
        }
      });

    return () => {
      active = false;
    };
  }, [input.regionCode]);

  useEffect(() => {
    let active = true;

    if (!input.regionCode || (!input.provinceCode && input.regionCode !== "1300000000")) {
      queueMicrotask(() => {
        if (active) {
          setCitiesMunicipalities([]);
        }
      });
      return;
    }

    getCitiesMunicipalities(
      input.provinceCode
        ? { provinceCode: input.provinceCode }
        : { regionCode: input.regionCode },
    )
      .then((items) => {
        if (active) {
          setCitiesMunicipalities(items);
        }
      })
      .catch(() => {
        if (active) {
          setCitiesMunicipalities([]);
        }
      });

    return () => {
      active = false;
    };
  }, [input.regionCode, input.provinceCode]);

  useEffect(() => {
    let active = true;

    if (!input.cityMunicipalityCode) {
      queueMicrotask(() => {
        if (active) {
          setBarangays([]);
        }
      });
      return;
    }

    getBarangays({ cityMunicipalityCode: input.cityMunicipalityCode })
      .then((items) => {
        if (active) {
          setBarangays(items);
        }
      })
      .catch(() => {
        if (active) {
          setBarangays([]);
        }
      });

    return () => {
      active = false;
    };
  }, [input.cityMunicipalityCode]);

  return {
    regions,
    provinces,
    citiesMunicipalities,
    barangays,
  };
}
