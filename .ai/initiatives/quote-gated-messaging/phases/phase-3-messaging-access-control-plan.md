# Phase 3: Messaging Access Control Plan

Status: passed

## Goal

Implement server-side participant and quote-gate checks for conversation reads and message writes.

## Scope

- Importer participant resolution.
- Forwarder company participant resolution.
- Quote-gate helper.
- Conversation read authorization.
- Message create authorization.
- Direct URL/action abuse prevention.

Allowed file changes during execution, only if needed:

- `lib/**` for messaging authorization/query helpers
- `app/**` only for route/action integration needed to prove access checks
- `.ai/initiatives/quote-gated-messaging/phases/phase-3-messaging-access-control-plan.md`
- `.ai/initiatives/quote-gated-messaging/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Full messaging UI.
- Realtime infrastructure.
- Notifications.
- Attachments.
- Admin inspection.
- Payment or quote acceptance logic.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Conversation/message schema.
- Current authz helpers.
- Completed request and quote helper patterns.

## Tasks

- Add importer-side participant check by request ownership.
- Add forwarder-side participant check by forwarder membership.
- Add quote gate requiring a submitted quote for request plus forwarder company.
- Ensure conversation lookup is participant-scoped.
- Ensure message create repeats all access checks.
- Block no-quote, competitor, unrelated importer, and unauthenticated cases.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Participant checks compile.
- No-quote access is blocked by server code.
- Competitor forwarder access is blocked by query/authorization shape.
- Direct action abuse is blocked even without UI.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor query/helper mismatch inside messaging access scope.

Hard-stop instead of repairing when:

- Participant rules are ambiguous.
- Quote-gate rule cannot be enforced server-side.
- Admin inspection is required.
- Privacy cannot be enforced without larger architecture changes.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Added `lib/messages.ts` with quote-gated conversation creation helpers.
- Importer conversation creation requires ownership of the request and an eligible quote from the target forwarder company.
- Forwarder conversation creation requires forwarder membership and an eligible quote from the current forwarder company.
- Conversation reads are scoped by importer profile or forwarder company.
- Message writes re-enter participant-scoped conversation helpers before inserting.
- No UI, route, realtime, attachment, notification, or admin behavior was added in this phase.
