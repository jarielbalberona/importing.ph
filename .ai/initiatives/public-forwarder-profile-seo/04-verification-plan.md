# Verification Plan

## Dependency Verification

Before execution:

- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.
- Confirm `forwarder-open-requests` has a final passing or explicitly accepted report.
- Confirm `quote-submission-privacy` has a final passing or explicitly accepted report.
- Confirm `importer-quote-comparison` has a final passing or explicitly accepted report.
- Confirm product review approves executing public SEO before or after full marketplace loop completion.

If dependencies are incomplete and not accepted, keep this initiative deferred.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f app/page.tsx`
- `test -f app/layout.tsx`
- `test -f db/schema.ts`
- `find app -maxdepth 4 -type f | sort`
- `rg -n "metadata|generateMetadata|sitemap|robots|forwarder|profile|service|slug|public|shipping|lane" app components db lib`

Expected evidence:

- Current public route baseline is documented.
- Current metadata convention is documented.
- Current forwarder company/profile schema is documented.
- Deferred/execute recommendation is documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence if implementation proceeds:

- Public-safe forwarder DTO/schema compiles.
- Slug and visibility model compiles.
- Private fields are documented as forbidden.

If implementation remains deferred:

- Phase report documents required data model before execution.

## Phase 3 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence if implementation proceeds:

- Directory/profile routes compile.
- Route/lane compatibility is defined or implemented minimally.
- Metadata behavior compiles.

If implementation remains deferred:

- Phase report documents route plan and metadata requirements only.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Public DTO/query boundary excludes private marketplace data.
- Suspended/unverified visibility behavior is documented or implemented.
- No quote/request/message/importer data is exposed.

## Phase 5 Automated Verification

Commands:

- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`, or exact failure/skip reason and impact is recorded.

## Phase 5 Manual Smoke

Smoke cases if implementation proceeds:

- Public profile renders only public-safe data.
- Private marketplace data is not exposed.
- Suspended forwarder behavior matches product rules.
- Metadata renders correctly if implemented.

If this remains deferred, manual smoke is not applicable. Record the deferral reason and do not claim public SEO is proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`, or the initiative remains draft/deferred by review.
- If executed, `reports/final-report.md` exists.
- If executed, automated verification evidence is recorded.
- If executed, privacy/metadata smoke result or explicit skip impact is recorded.
- No CMS, article publishing, reviews/ratings, private marketplace leakage, payment, tracking, escrow, analytics, ERP, subscription, queue, Redis, WebSocket, microservice, Prisma, Express, AWS, or Terraform scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and deferred planning checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

If this initiative is later executed and needs fixture forwarder profiles, use a dedicated test database:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_public_forwarder_profile_seo_test
```

Requirements:

- Run migrations against the test database before route smoke: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed public-visible and hidden/suspended forwarder companies with deterministic slugs/prefixes.
- Clean up seeded forwarder profile, slug, visibility, and service-profile rows by exact test prefix.
- Never run destructive reset or smoke cleanup against non-local databases.

## Dedicated Step-By-Step Smoke Tests

Run these only if implementation proceeds. If this initiative remains deferred, record the deferral and do not claim public SEO is proven.

### Public Profile Visibility

1. Account/role: none; public visitor.
2. Route: `/forwarders/[slug]`.
3. Action: visit a seeded public-visible forwarder profile.
4. Expected UI result: page renders only public-safe forwarder fields.
5. Expected database state: no mutation.
6. Expected forbidden behavior: no importer, request, quote, message, internal id, Clerk id, suspension reason, or competitor data appears.
7. Pass/fail: pass only if public data boundary is clean.

### Hidden Or Suspended Forwarder

1. Account/role: none; public visitor.
2. Route: `/forwarders/[hiddenOrSuspendedSlug]`.
3. Action: visit directly.
4. Expected UI result: not found or equivalent non-leaking response.
5. Expected database state: no mutation.
6. Pass/fail: pass only if hidden/suspended state is not publicly exposed.

### Metadata Smoke

1. Account/role: none; public visitor.
2. Route: `/forwarders/[slug]` and any implemented `/shipping/*` route.
3. Action: inspect rendered metadata.
4. Expected UI/result: title and description use public-safe facts only.
5. Pass/fail: pass only if metadata contains no private marketplace data or unsupported claims.
