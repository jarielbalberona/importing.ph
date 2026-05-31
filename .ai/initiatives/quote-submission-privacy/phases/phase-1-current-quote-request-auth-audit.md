# Phase 1: Current Quote Request Auth Audit

Status: pending

## Goal

Document current quote, request, forwarder, importer, auth, and privacy baseline before implementing quote submission.

## Scope

- Inspect current schema and migrations.
- Inspect completed request and forwarder browsing artifacts.
- Inspect current importer and forwarder routes.
- Inspect role guards.
- Search for quote placeholders.
- Record gaps and hard blockers.

Allowed file changes during execution:

- `.ai/initiatives/quote-submission-privacy/phases/phase-1-current-quote-request-auth-audit.md`
- `.ai/initiatives/quote-submission-privacy/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Quote implementation.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- importer request routes.
- forwarder request routes.
- completed request/open-request helpers.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record current request schema/status truth.
- Record current forwarder open request route/detail truth.
- Record current quote schema/action/UI truth.
- Record current suspended-forwarder truth.
- Record privacy gaps for later phases.

## Verification Commands

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f app/app/forwarder/requests/page.tsx`
- `test -f app/app/requests/page.tsx`

## Expected Evidence

- Phase report documents current quote/request/auth baseline.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Posted request schema is absent.
- Open request browsing is absent.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
