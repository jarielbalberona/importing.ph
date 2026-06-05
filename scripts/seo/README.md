# Local SEO Workbench

This is a local workbench. It is not a runtime SEO feature, not a CMS, and not a page generator.

It exists to verify the public Guides/content surface and to run cautious local SEO research workflows without pushing SEO logic into app runtime code paths.

## Scope

- Rendered-page verification for public routes
- Sitemap and robots checks
- Markdown mirror coverage checks
- Developer-copy leakage checks
- Mock-first keyword planning
- Mock-first SERP evidence checks
- Optional DataForSEO adapter with dry-run-by-default cost controls

## Public Route Boundary

The workbench reads the existing public-content source of truth. It does not maintain a second route registry for published guides.

Covered routes:

- `/`
- `/guides`
- each published `/guides/[slug]`
- each published `/guides/[slug]/markdown`

## Commands

Run local tests for the workbench:

```bash
npm run seo:test
```

Run rendered verification against a local app:

```bash
LOCAL_SEO_BASE_URL=http://127.0.0.1:3001 npm run seo:verify
```

Run the local SEO audit with the mock provider:

```bash
LOCAL_SEO_BASE_URL=http://127.0.0.1:3001 npm run seo:audit:mock
```

Run keyword planning with the mock provider:

```bash
npm run seo:keyword-plan
```

Run SERP evidence lookup with the mock provider:

```bash
npm run seo:serp-rank
```

Run cache-only mode:

```bash
npm run seo:keyword-plan -- --cache-only
npm run seo:serp-rank -- --cache-only
```

## Environment

Default local base URL:

```bash
LOCAL_SEO_BASE_URL=http://localhost:3000
```

Optional DataForSEO credentials. These are required only when `--provider dataforseo` is selected:

```bash
DATAFORSEO_LOGIN=...
DATAFORSEO_PASSWORD=...
```

## DataForSEO Safety Rules

- Default provider is `mock`
- Live mode is disabled unless `--confirm-live` is passed
- Above soft limits you must pass `--allow-over-limit`
- Hard limits stop execution
- Cache-first behavior is on by default
- `--cache-only` avoids provider calls entirely
- Credentials are never printed
- Thrown errors redact configured secrets

Suggested limits:

- Keyword plan: soft 20, hard 50
- SERP rank: soft 5, hard 10

## PH Market Targeting

Supported local workbench markets:

- `ph`
- `ph_mobile`

Do not pretend this is global SEO tooling. The workbench is intentionally scoped to the Philippines-first product surface.
