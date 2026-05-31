# Phase 1: Current Notification Event Audit

Status: pending

## Goal

Document current notification placeholders and actual event sources before implementing notification records.

## Scope

- Inspect completed dependency reports and artifacts.
- Inspect current schema and migrations.
- Inspect request, quote, quote-decision, and message actions.
- Inspect authz helpers and route constants.
- Search for notification, email, and event placeholders.
- Record event-source gaps and hard blockers.

Allowed file changes during execution:

- `.ai/initiatives/notification-records/phases/phase-1-current-notification-event-audit.md`
- `.ai/initiatives/notification-records/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Notification implementation.
- Email integration.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- `lib/routes.ts`
- request actions/routes.
- quote actions/routes.
- quote comparison actions/routes.
- messaging actions/routes.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record whether notification placeholders exist.
- Record actual request-posted event source truth.
- Record actual quote-submitted event source truth.
- Record actual message-created event source truth.
- Record actual quote-accepted/rejected event source truth.
- Record whether quote expiration data exists.
- Record whether safe forwarder matching rules exist.

## Verification Commands

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `rg -n "notification|notify|event|resend|email|mail" app db lib components scripts package.json`
- `rg -n "quote|message|conversation|shipment|request" app db lib components scripts`

## Expected Evidence

- Phase report documents current notification/event baseline.
- Phase report says which requested notification events can be implemented.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Required event sources are absent.
- Matching request notification rules are unsafe or ambiguous.
- Quote-expiring-soon requires async infrastructure.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Filled by the execution skill or runner.
