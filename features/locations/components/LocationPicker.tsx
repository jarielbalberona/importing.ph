"use client";

import type { LocationOption } from "@/features/locations/api/locations";
import { LocationCombobox } from "@/features/locations/components/LocationCombobox";
import { useLocationSelection } from "@/features/locations/hooks/useLocationSelection";

export type DestinationSelection = {
  regionCode?: string;
  regionName?: string;
  provinceCode?: string;
  provinceName?: string;
  cityMunicipalityCode?: string;
  cityMunicipalityName?: string;
  barangayCode?: string;
  barangayName?: string;
};

export function LocationPicker({
  value,
  onChange,
  errors,
}: {
  value: DestinationSelection;
  onChange: (value: DestinationSelection) => void;
  errors?: {
    region?: string;
    province?: string;
    cityMunicipality?: string;
    barangay?: string;
  };
}) {
  const {
    regions,
    provinces,
    citiesMunicipalities,
    barangays,
  } = useLocationSelection({
    regionCode: value.regionCode,
    provinceCode: value.provinceCode,
    cityMunicipalityCode: value.cityMunicipalityCode,
  });
  const isNcr = value.regionCode === "1300000000";

  function selectRegion(option: LocationOption | null) {
    onChange({
      regionCode: option?.regionCode ?? option?.code ?? undefined,
      regionName: option?.regionName ?? option?.name ?? undefined,
      provinceCode: undefined,
      provinceName: undefined,
      cityMunicipalityCode: undefined,
      cityMunicipalityName: undefined,
      barangayCode: undefined,
      barangayName: undefined,
    });
  }

  function selectProvince(option: LocationOption | null) {
    onChange({
      regionCode: option?.regionCode ?? value.regionCode,
      regionName: option?.regionName ?? value.regionName,
      provinceCode: option?.provinceCode ?? option?.code ?? undefined,
      provinceName: option?.provinceName ?? option?.name ?? undefined,
      cityMunicipalityCode: undefined,
      cityMunicipalityName: undefined,
      barangayCode: undefined,
      barangayName: undefined,
    });
  }

  function selectCityMunicipality(option: LocationOption | null) {
    onChange({
      ...value,
      regionCode: option?.regionCode ?? value.regionCode,
      regionName: option?.regionName ?? value.regionName,
      provinceCode: option?.provinceCode ?? value.provinceCode,
      provinceName: option?.provinceName ?? value.provinceName,
      cityMunicipalityCode: option?.cityMunicipalityCode ?? option?.code ?? undefined,
      cityMunicipalityName: option?.cityMunicipalityName ?? option?.name ?? undefined,
      barangayCode: undefined,
      barangayName: undefined,
    });
  }

  function selectBarangay(option: LocationOption | null) {
    onChange({
      ...value,
      barangayCode: option?.code ?? undefined,
      barangayName: option?.name ?? undefined,
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LocationField
        label="Destination region"
        helper="Select the Philippine region for this shipment destination."
        error={errors?.region}
      >
        <LocationCombobox
          options={regions}
          value={value.regionCode}
          onValueChange={selectRegion}
          placeholder="Search region"
          emptyMessage="No region found."
          invalid={Boolean(errors?.region)}
        />
      </LocationField>
      <LocationField
        label="Destination province"
        helper={
          isNcr
            ? "NCR has no province level. Continue with the city or municipality."
            : "Select the province for the delivery destination."
        }
        error={errors?.province}
      >
        <LocationCombobox
          options={provinces}
          value={value.provinceCode}
          onValueChange={selectProvince}
          placeholder={
            value.regionCode
              ? isNcr
                ? "No province required for NCR"
                : "Search province"
              : "Select region first"
          }
          emptyMessage="No province found."
          disabled={!value.regionCode || isNcr}
          invalid={Boolean(errors?.province)}
        />
      </LocationField>
      <LocationField
        label="Destination city or municipality"
        helper="Required for quote matching and delivery scope."
        error={errors?.cityMunicipality}
      >
        <LocationCombobox
          options={citiesMunicipalities}
          value={value.cityMunicipalityCode}
          onValueChange={selectCityMunicipality}
          placeholder={
            value.provinceCode || isNcr
              ? "Search city or municipality"
              : "Select province first"
          }
          emptyMessage="No city or municipality found."
          disabled={!value.provinceCode && !isNcr}
          invalid={Boolean(errors?.cityMunicipality)}
        />
      </LocationField>
      <LocationField
        label="Barangay"
        helper="Optional. Add this only when door-to-door delivery needs a more specific destination."
        error={errors?.barangay}
      >
        <LocationCombobox
          options={barangays}
          value={value.barangayCode}
          onValueChange={selectBarangay}
          placeholder={
            value.cityMunicipalityCode
              ? "Search barangay"
              : "Select city first"
          }
          emptyMessage="No barangay found."
          disabled={!value.cityMunicipalityCode}
          invalid={Boolean(errors?.barangay)}
        />
      </LocationField>
    </div>
  );
}

function LocationField({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
      <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
