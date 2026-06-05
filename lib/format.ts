export function titleFromEnum(value: string | null | undefined) {
  if (!value) {
    return "Not provided";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const deliveryPreferenceLabels: Record<string, string> = {
  supplier_pickup_to_door: "Supplier pickup -> my address",
  china_warehouse_to_door: "China warehouse -> my address",
  supplier_pickup_to_ph_warehouse: "Supplier pickup -> PH warehouse pickup",
  china_warehouse_to_ph_warehouse: "China warehouse -> PH warehouse pickup",
  not_sure: "Not sure, recommend for me",
};

const shippingModePreferenceLabels: Record<string, string> = {
  sea: "Sea cargo",
  air: "Air cargo",
  either: "Open to either",
};

const quoteShippingModeLabels: Record<string, string> = {
  sea: "Sea cargo",
  air: "Air cargo",
};

export function formatDeliveryPreference(value: string | null | undefined) {
  if (!value) {
    return "Not provided";
  }

  return deliveryPreferenceLabels[value] ?? titleFromEnum(value);
}

export function formatShippingModePreference(
  value: string | null | undefined,
) {
  if (!value) {
    return "Not provided";
  }

  return shippingModePreferenceLabels[value] ?? titleFromEnum(value);
}

export function formatQuoteShippingMode(value: string | null | undefined) {
  if (!value) {
    return "Not provided";
  }

  return quoteShippingModeLabels[value] ?? titleFromEnum(value);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(value);
}

export function formatRoute(origin: string, destination: string) {
  return `${origin} to ${destination}`;
}

export function formatDestination(input: {
  destination?: string | null;
  destinationDisplayName?: string | null;
  destinationRegionName?: string | null;
  destinationProvinceName?: string | null;
  destinationCityMunicipalityName?: string | null;
  destinationBarangayName?: string | null;
  destinationAddressDetails?: string | null;
}) {
  if (input.destinationDisplayName) {
    return input.destinationDisplayName;
  }

  const locality = [
    input.destinationBarangayName,
    input.destinationCityMunicipalityName,
    input.destinationProvinceName,
    input.destinationProvinceName ? null : input.destinationRegionName,
  ].filter(Boolean);

  if (locality.length > 0) {
    return locality.join(", ");
  }

  return input.destination || "Not provided";
}

export function formatStructuredRoute(input: {
  origin: string;
  destination?: string | null;
  destinationDisplayName?: string | null;
  destinationRegionName?: string | null;
  destinationProvinceName?: string | null;
  destinationCityMunicipalityName?: string | null;
  destinationBarangayName?: string | null;
  destinationAddressDetails?: string | null;
}) {
  return formatRoute(input.origin, formatDestination(input));
}

export function formatMeasure(value: string | number | null | undefined, unit: string) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return `${value} ${unit}`;
}

export function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function formatMoney(currency: string, value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${currency} ${value}`;
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDimensions(input: {
  lengthCm?: string | null;
  widthCm?: string | null;
  heightCm?: string | null;
}) {
  if (!input.lengthCm || !input.widthCm || !input.heightCm) {
    return "Not provided";
  }

  return `${input.lengthCm} x ${input.widthCm} x ${input.heightCm} cm`;
}
