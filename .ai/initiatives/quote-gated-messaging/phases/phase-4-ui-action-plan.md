# Phase 4: UI Action Plan

Status: passed

## Goal

Implement simple importer and forwarder conversation list/detail surfaces plus message creation.

## Scope

- Importer conversation list/detail route.
- Forwarder conversation list/detail route.
- Message compose form.
- Message create server action.
- Empty, loading, and error states.
- Plain request/response behavior.

Allowed file changes during execution, only if needed:

- `app/app/requests/**`
- `app/app/forwarder/**`
- `components/**` for small reusable UI only if justified
- `lib/**` for message actions/helpers
- `.ai/initiatives/quote-gated-messaging/phases/phase-4-ui-action-plan.md`
- `.ai/initiatives/quote-gated-messaging/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Realtime delivery.
- WebSockets.
- Queues or background jobs.
- Notifications.
- Attachments.
- Read receipts unless already decided in Phase 2.
- Admin message inspection.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Existing UI primitives.
- Current route conventions.

## Tasks

- Add conversation list for importer-owned request conversations.
- Add conversation detail for importer participant.
- Add conversation list/detail for forwarder participant.
- Add message compose form and server action.
- Render messages chronologically.
- Add empty and access-denied handling consistent with existing route behavior.
- Confirm no realtime dependencies were added.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Importer messaging routes compile.
- Forwarder messaging routes compile.
- Message action validates body and participant access.
- Empty/error states exist.
- No realtime, queue, Redis, or WebSocket dependency was added.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor form/action mismatch inside messaging UI scope.

Hard-stop instead of repairing when:

- UX requires realtime chat.
- Notification or attachment scope is requested.
- Route structure conflicts with completed request/quote route ownership.
- Privacy behavior is ambiguous.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Added importer messaging routes under `/app/requests/messages`.
- Added forwarder messaging routes under `/app/forwarder/messages`.
- Added participant-scoped message send actions.
- Added quote-detail entry points: importer can message a quoting forwarder from a quote card; forwarder can message the importer after submitting a quote.
- Rendered chronological message lists and empty states.
- No realtime, queue, Redis, WebSocket, notification, attachment, or admin inspection behavior was added.
