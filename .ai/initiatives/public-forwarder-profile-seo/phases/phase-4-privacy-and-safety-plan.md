# Phase 4: Privacy And Safety Plan

Status: pending

## Goal

Define and verify public privacy rules, suspended/unverified forwarder behavior, and public-safe query boundaries.

## Scope

- Public-safe DTO/query boundary.
- No private marketplace leakage.
- Suspended forwarder visibility.
- Unverified/incomplete forwarder visibility.
- Admin or forwarder visibility controls if required.

Allowed file changes during execution, only if needed and approved:

- `lib/**` for public-safe query/DTO helpers
- public route files from Phase 3 if already implemented
- admin/forwarder visibility-control files only if explicitly required
- `.ai/initiatives/public-forwarder-profile-seo/phases/phase-4-privacy-and-safety-plan.md`
- `.ai/initiatives/public-forwarder-profile-seo/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Admin back office beyond visibility control.
- Reviews/ratings.
- Public quote/request/message pages.
- Analytics.
- Payments, tracking, escrow, ERP, subscriptions.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Basic admin/safety decisions if available.

## Tasks

- Define forbidden public data list.
- Define public-safe query shape.
- Define suspended forwarder public visibility behavior.
- Define unverified/incomplete profile behavior.
- Define visibility control ownership if required.
- Verify public routes do not join private marketplace data.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Privacy boundary is documented.
- Suspended/unverified behavior is documented or implemented.
- If implemented, public routes compile and lint passes.
- No quote/request/message/importer data is exposed.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor DTO/query mismatch inside public privacy scope.

Hard-stop instead of repairing when:

- Public data boundaries are ambiguous.
- Suspended/unverified visibility requires product decision.
- Any implementation exposes private marketplace data.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- If implementation proceeds and needs fixture public profiles, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed public-visible and hidden/suspended forwarder profile fixtures with deterministic slugs/prefixes. If a needed fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic slug prefix or test account id. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, public-safe fields, slug uniqueness, visibility controls, suspended-forwarder behavior, or private marketplace data exposure.

## Completion Notes

Filled by the execution skill or runner.
