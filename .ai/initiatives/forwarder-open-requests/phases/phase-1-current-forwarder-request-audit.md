# Phase 1: Current Forwarder Request Audit

Status: pending

## Goal

Document the current forwarder route and completed shipment request schema before implementing open request browsing.

## Scope

- Inspect forwarder route.
- Inspect auth and route helpers.
- Inspect current schema and migrations.
- Inspect completed dependency artifacts.
- Identify available request fields and missing filter support.

Allowed file changes during execution:

- `.ai/initiatives/forwarder-open-requests/phases/phase-1-current-forwarder-request-audit.md`
- `.ai/initiatives/forwarder-open-requests/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Filter implementation.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `app/app/forwarder/requests/page.tsx`
- `lib/authz.ts`
- `lib/routes.ts`
- `db/schema.ts`
- `drizzle/`
- Existing UI primitives.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record current forwarder route behavior.
- Record available shipment request fields.
- Record whether quote data exists.
- Record whether suspended forwarder state exists.
- Record filter gaps and privacy risks.

## Verification Commands

- `git status --short`
- `test -f app/app/forwarder/requests/page.tsx`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`

## Expected Evidence

- Phase report documents baseline and gaps.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Request schema is absent.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
