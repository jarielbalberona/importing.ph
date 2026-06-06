export const defaultForwarderSlugFallback = "forwarder-company";
export const defaultImporterSlugFallback = "importer-profile";

type UniqueSlugOptions = {
  fallback: string;
  isUnique: (slug: string) => Promise<boolean>;
};

export function normalizeSlug(input: string | null | undefined) {
  const normalized = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized;
}

export function normalizeSlugWithFallback(
  input: string | null | undefined,
  fallback: string,
) {
  const normalized = normalizeSlug(input);

  return normalized || normalizeSlug(fallback) || "profile";
}

export function getForwarderCompanySlugSource(companyName: string) {
  return normalizeSlugWithFallback(companyName, defaultForwarderSlugFallback);
}

export function getImporterProfileSlugSource(input: {
  companyName?: string | null;
  fullName?: string | null;
}) {
  return normalizeSlugWithFallback(
    input.companyName || input.fullName,
    defaultImporterSlugFallback,
  );
}

export async function generateUniqueSlug(
  input: string | null | undefined,
  options: UniqueSlugOptions,
) {
  const baseSlug = normalizeSlugWithFallback(input, options.fallback);

  if (await options.isUnique(baseSlug)) {
    return baseSlug;
  }

  for (let suffix = 2; suffix < 10_000; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;

    if (await options.isUnique(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to generate a unique slug for base "${baseSlug}".`);
}
