# Phase 1: Public SEO Current-State Audit

Status: pending

## Goal

Document current public routes, landing page, metadata conventions, forwarder data model, and whether this initiative should remain deferred.

## Scope

- Inspect public route tree.
- Inspect landing page implementation.
- Inspect metadata conventions.
- Inspect sitemap/robots presence or absence.
- Inspect forwarder company/profile schema.
- Inspect completed marketplace dependency artifacts.
- Record current gaps and deferral recommendation.

Allowed file changes during execution:

- `.ai/initiatives/public-forwarder-profile-seo/phases/phase-1-public-seo-current-state-audit.md`
- `.ai/initiatives/public-forwarder-profile-seo/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Public route implementation.
- Metadata implementation.
- Sitemap implementation.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `app/page.tsx`
- `app/layout.tsx`
- `db/schema.ts`
- `components/`
- existing public route tree.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record current public routes.
- Record current metadata pattern.
- Record whether sitemap/robots exist.
- Record current forwarder company/profile data.
- Confirm whether the initiative remains deferred.

## Verification Commands

- `git status --short`
- `test -f app/page.tsx`
- `test -f app/layout.tsx`
- `test -f db/schema.ts`
- `find app -maxdepth 4 -type f | sort`
- `rg -n "metadata|generateMetadata|sitemap|robots|forwarder|profile|service|slug|public|shipping|lane" app components db lib`

## Expected Evidence

- Phase report documents current public/SEO baseline.
- Phase report documents forwarder profile data gaps.
- Phase report states defer or proceed recommendation.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Marketplace loop dependencies are incomplete and not explicitly accepted.
- Product insists on executing SEO before marketplace validation without a clear decision.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- If implementation proceeds and needs fixture public profiles, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed public-visible and hidden/suspended forwarder profile fixtures with deterministic slugs/prefixes. If a needed fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic slug prefix or test account id. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, public-safe fields, slug uniqueness, visibility controls, suspended-forwarder behavior, or private marketplace data exposure.

## Completion Notes

Filled by the execution skill or runner.
