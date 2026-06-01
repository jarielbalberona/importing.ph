export function titleFromEnum(value: string | null | undefined) {
  if (!value) {
    return "Not provided";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
