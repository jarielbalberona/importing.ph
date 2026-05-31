# Phase 3: Public Routes And SEO Plan

Status: pending

## Goal

Define public forwarder directory/profile routes, route/lane compatibility, metadata conventions, and sitemap implications.

## Scope

- `/forwarders` route plan.
- `/forwarders/[slug]` route plan.
- `/shipping/*` lane route plan.
- Route-specific metadata plan.
- Sitemap/robots implications if supported or needed.
- Implementation only if execution is explicitly approved.

Allowed file changes during execution, only if needed and approved:

- `app/forwarders/**`
- `app/shipping/**`
- `app/sitemap.ts` or equivalent only if deliberately introduced
- `app/robots.ts` or equivalent only if deliberately introduced
- `lib/**` for public route helpers
- `.ai/initiatives/public-forwarder-profile-seo/phases/phase-3-public-routes-and-seo-plan.md`
- `.ai/initiatives/public-forwarder-profile-seo/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- CMS.
- Import guide articles.
- Reviews/ratings.
- Analytics.
- Public request marketplace.
- Private marketplace data.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Existing App Router conventions.
- Current metadata convention.

## Tasks

- Define directory route behavior.
- Define profile route behavior.
- Define future lane route pattern.
- Define metadata title/description/canonical pattern.
- Define sitemap/robots behavior if applicable.
- Keep lane pages factual and minimal.
- If approved, implement minimal routes.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Route and metadata plan is documented.
- If implemented, routes compile and lint passes.
- No private marketplace data is queried.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor route/metadata mismatch inside approved public SEO scope.

Hard-stop instead of repairing when:

- Content scope becomes CMS/articles.
- Lane pages require unsupported marketplace claims.
- Public routes need private request/quote/message data.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- If implementation proceeds and needs fixture public profiles, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed public-visible and hidden/suspended forwarder profile fixtures with deterministic slugs/prefixes. If a needed fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic slug prefix or test account id. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, public-safe fields, slug uniqueness, visibility controls, suspended-forwarder behavior, or private marketplace data exposure.

## Completion Notes

Filled by the execution skill or runner.
