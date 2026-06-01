# Phase 1: Current Messaging Placeholder Audit

Status: passed

## Goal

Document current request, quote, auth, and messaging baseline before implementing quote-gated conversations.

## Scope

- Inspect completed dependency reports and artifacts.
- Inspect current schema and migrations.
- Inspect current importer and forwarder routes.
- Inspect authz helpers and route constants.
- Search for conversation/message placeholders.
- Record gaps and hard blockers.

Allowed file changes during execution:

- `.ai/initiatives/quote-gated-messaging/phases/phase-1-current-messaging-placeholder-audit.md`
- `.ai/initiatives/quote-gated-messaging/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Messaging implementation.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- `lib/routes.ts`
- importer request routes.
- forwarder request routes.
- quote submission and privacy helpers.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Confirm whether `importer-quote-comparison` is required before messaging.
- Record current request ownership truth.
- Record current quote schema/status truth.
- Record current messaging placeholder truth.
- Record route/helper gaps for participant checks.

## Verification Commands

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `test -d app/app/requests`
- `test -d app/app/forwarder/requests`
- `rg -n "conversation|message|messages|quote" app db lib components scripts`

## Expected Evidence

- Phase report documents current request/quote/auth/messaging baseline.
- Phase report says whether messaging placeholders exist.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Quote submission/privacy is not proven.
- Product requires quote comparison before messaging and that initiative is incomplete.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Dependency final reports are present for `local-db-migration-proof`, `auth-onboarding-roles`, `shipment-request-wizard`, `forwarder-open-requests`, `quote-submission-privacy`, and `importer-quote-comparison`.
- `importer-quote-comparison` is complete enough for messaging execution. Messaging should open after quote submission, and current quote rows remain available after accept/reject.
- Current request ownership truth is `shipment_requests.importer_profile_id`.
- Current quote gate truth is `quotes.shipment_request_id` plus `quotes.forwarder_company_id`.
- Current quote statuses are `submitted`, `accepted`, `rejected`, and `withdrawn`.
- Current request statuses are `draft`, `posted`, `quote_selected`, and `cancelled`.
- Current auth helpers provide database-backed `requireRole`, importer profile lookup, and forwarder member lookup.
- No `conversations` table, `messages` table, messaging routes, messaging actions, or participant-check helper exists yet.
- Phase 2 should add explicit conversation/message schema and indexes without changing quote privacy boundaries.
