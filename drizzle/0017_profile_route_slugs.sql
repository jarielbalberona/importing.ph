ALTER TABLE "forwarder_companies"
ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint

ALTER TABLE "importer_profiles"
ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint

WITH normalized_forwarder_companies AS (
  SELECT
    fc.id,
    CASE
      WHEN base_slug = '' THEN 'forwarder-company'
      ELSE base_slug
    END AS base_slug,
    row_number() OVER (
      PARTITION BY CASE
        WHEN base_slug = '' THEN 'forwarder-company'
        ELSE base_slug
      END
      ORDER BY fc.created_at, fc.id
    ) AS slug_rank
  FROM (
    SELECT
      id,
      created_at,
      regexp_replace(
        regexp_replace(
          regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g'),
          '-+',
          '-',
          'g'
        ),
        '(^-+|-+$)',
        '',
        'g'
      ) AS base_slug
    FROM forwarder_companies
  ) AS fc
)
UPDATE "forwarder_companies" AS fc
SET "slug" = CASE
  WHEN nfc.slug_rank = 1 THEN nfc.base_slug
  ELSE nfc.base_slug || '-' || nfc.slug_rank
END
FROM normalized_forwarder_companies AS nfc
WHERE fc.id = nfc.id
  AND fc.slug IS NULL;--> statement-breakpoint

WITH normalized_importer_profiles AS (
  SELECT
    ip.id,
    CASE
      WHEN base_slug = '' THEN 'importer-profile'
      ELSE base_slug
    END AS base_slug,
    row_number() OVER (
      PARTITION BY CASE
        WHEN base_slug = '' THEN 'importer-profile'
        ELSE base_slug
      END
      ORDER BY ip.created_at, ip.id
    ) AS slug_rank
  FROM (
    SELECT
      ip.id,
      ip.created_at,
      regexp_replace(
        regexp_replace(
          regexp_replace(
            lower(trim(coalesce(nullif(ip.company_name, ''), nullif(up.full_name, ''), 'importer-profile'))),
            '[^a-z0-9]+',
            '-',
            'g'
          ),
          '-+',
          '-',
          'g'
        ),
        '(^-+|-+$)',
        '',
        'g'
      ) AS base_slug
    FROM importer_profiles AS ip
    INNER JOIN user_profiles AS up
      ON up.id = ip.user_profile_id
  ) AS ip
)
UPDATE "importer_profiles" AS ip
SET "slug" = CASE
  WHEN nip.slug_rank = 1 THEN nip.base_slug
  ELSE nip.base_slug || '-' || nip.slug_rank
END
FROM normalized_importer_profiles AS nip
WHERE ip.id = nip.id
  AND ip.slug IS NULL;--> statement-breakpoint

ALTER TABLE "forwarder_companies"
ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "importer_profiles"
ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "forwarder_companies_slug_idx"
ON "forwarder_companies" USING btree ("slug");--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "importer_profiles_slug_idx"
ON "importer_profiles" USING btree ("slug");
