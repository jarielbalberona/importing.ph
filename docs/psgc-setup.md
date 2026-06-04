# PSGC Setup

Runtime location lookup uses PostgreSQL tables, not frontend JSON.

The import script expects PSGC JSON files in `data/psgc` by default:

```txt
data/psgc/regions.json
data/psgc/provinces.json
data/psgc/muncities.json
data/psgc/barangays.json
```

These files are intentionally ignored by Git because barangay data is large and
must not be bundled into the frontend. Keep source archives outside the app
bundle and import them into the database.

Run:

```bash
PSGC_VERSION=2025-2Q pnpm db:import-psgc
```

For a custom source directory:

```bash
PSGC_DATA_DIR=/path/to/psgc-json PSGC_VERSION=2025-2Q pnpm db:import-psgc
```

Dry-run parsing and row counts:

```bash
PSGC_DATA_DIR=/path/to/psgc-json PSGC_VERSION=2025-2Q pnpm db:import-psgc -- --dry-run
```

Expected local row counts for the official `2025-2Q` source currently used by
this project:

```txt
regions: 18
provinces/province-like rows: 117
cities/municipalities: 1656
barangays: 42011
```

The import is repeat-safe. It upserts current rows and removes stale rows for
the same `PSGC_VERSION`, which prevents obsolete normalized rows such as short
NCR city pseudo-codes from surviving later imports.

Expected JSON shape can use either app-friendly keys:

```json
{ "code": "0704600000", "name": "Negros Oriental", "regionCode": "0700000000" }
```

or PSA-style fields:

```json
{
  "psgc_code": "0704600000",
  "area_name": "Negros Oriental",
  "reg": 7,
  "prv": 46,
  "mun": 0,
  "bgy": 0,
  "geographic_level": "Prov"
}
```

The importer also accepts the camelCase export shape currently used by this
project's local seed files:

```json
{ "psgcCode": "0704600000", "regCode": "07", "provCode": "046", "provName": "Negros Oriental" }
```

For city and barangay files, the equivalent name keys are `munCityName` and
`brgyName`. Some PSGC exports omit province-like or city-like parent rows for
highly urbanized cities. The importer derives those missing parent rows to keep
foreign keys valid while preserving the raw PSGC codes.

NCR handling:

NCR has no province level in PSGC. The request form supports `region + city`
for NCR destinations and `region + province + city` elsewhere. Do not invent a
fake Metro Manila province. Keep raw PSGC codes intact.

## Render Deployment Strategy

Render does not get PSGC data automatically from this repository. The files
under `data/psgc/*.json` are intentionally gitignored, so the current
`render.yaml` deploy will build and start the app but will not run PSGC import
and will not have seed files unless an operator provides them.

Use a manual one-off import per Render environment for V1:

1. Deploy the app normally.
2. Run database migrations against the Render database:

   ```bash
   npm run db:migrate
   ```

3. Provide the official PSGC JSON files on the Render runtime/job filesystem,
   or run the import from a trusted machine that has network access to the
   Render `DATABASE_URL`.
4. Run:

   ```bash
   PSGC_DATA_DIR=/path/to/psgc-json \
   PSGC_VERSION=2025-2Q \
   PSGC_PUBLISHED_DATE=2025-06-30 \
   npm run db:import-psgc
   ```

5. Confirm the command prints the expected row counts above.

Do not add `npm run db:import-psgc` to Render deploy hooks unless
`PSGC_DATA_DIR` is guaranteed to exist in that environment. Missing PSGC files
must fail loudly; an empty or skipped import is not acceptable for production
because the destination picker depends on these tables.

## Render Verification Checklist

After the first import in staging or production:

```bash
npm run db:check
```

Then verify the deployed API:

```bash
curl -sS "$APP_URL/v1/locations/regions"
curl -sS "$APP_URL/v1/locations/cities-municipalities?regionCode=1300000000&q=Makati"
curl -sS "$APP_URL/v1/locations/barangays?cityMunicipalityCode=1380300000&q=Bel-Air"
```

Expected:

- migrations are applied;
- PSGC import reports `18`, `117`, `1656`, and `42011` row counts;
- NCR cities return full 10-digit normalized codes such as `1380300000`;
- stale short-code NCR rows such as `80300`, `80600`, `81300`, or `81500` are absent;
- `/v1/locations/regions` returns region options;
- `/v1/locations/cities-municipalities?regionCode=1300000000` returns NCR cities without requiring a province;
- `/v1/locations/barangays?cityMunicipalityCode=1380300000` returns barangays for Makati.
