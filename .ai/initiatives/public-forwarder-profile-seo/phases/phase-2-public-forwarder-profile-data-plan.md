# Phase 2: Public Forwarder Profile Data Plan

Status: pending

## Goal

Define public-safe forwarder profile data, private forbidden fields, slug requirements, and visibility requirements.

## Scope

- Public-safe field definition.
- Private forbidden field definition.
- Slug model.
- Public visibility model.
- Service profile compatibility if present.
- Schema changes only if execution is explicitly approved.

Allowed file changes during execution, only if needed and approved:

- `db/schema.ts`
- `drizzle/**`
- `lib/**` for public profile DTO/query helpers
- `.ai/initiatives/public-forwarder-profile-seo/phases/phase-2-public-forwarder-profile-data-plan.md`
- `.ai/initiatives/public-forwarder-profile-seo/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Public page implementation unless execution is approved.
- Reviews/ratings.
- CMS/content articles.
- Private marketplace data exposure.
- Service profile requirements for quote submission.

## Inputs

- Phase 1 report.
- Current forwarder schema.
- Completed forwarder/request/quote dependency artifacts.
- Product privacy rules.

## Tasks

- Define public-safe fields.
- Define private fields that must never be public.
- Define slug uniqueness and stability rules.
- Define public visibility defaults and controls.
- Define suspended/unverified profile data impact for Phase 4.
- Define service profile compatibility without blocking quoting.
- If approved, implement minimal schema/DTO.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Public-safe data contract is documented.
- Slug/visibility requirements are documented.
- Private fields are explicitly excluded.
- If implemented, code compiles and lint passes.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor DTO/schema mismatch inside approved public profile scope.

Hard-stop instead of repairing when:

- Public-safe fields are ambiguous.
- Slug or visibility behavior is unresolved.
- Product asks to expose request, quote, message, importer, review, or rating data.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- If implementation proceeds and needs fixture public profiles, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed public-visible and hidden/suspended forwarder profile fixtures with deterministic slugs/prefixes. If a needed fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic slug prefix or test account id. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, public-safe fields, slug uniqueness, visibility controls, suspended-forwarder behavior, or private marketplace data exposure.

## Completion Notes

Filled by the execution skill or runner.
