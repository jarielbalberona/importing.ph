# Phase 4: Notification UI List Plan

Status: passed

## Goal

Implement minimal recipient-scoped notification list and read behavior.

## Scope

- Notification list route.
- Recipient-scoped notification query.
- Mark-read action.
- Read/unread display.
- Notification link behavior.
- Empty/error states.

Allowed file changes during execution, only if needed:

- `app/**` for notification list/read routes
- `lib/**` for notification read/query helpers
- `components/**` for small reusable UI only if justified
- `.ai/initiatives/notification-records/phases/phase-4-notification-ui-list-plan.md`
- `.ai/initiatives/notification-records/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Email sending.
- Push notifications.
- Realtime updates.
- Admin notification views.
- Analytics.
- Notification preferences.
- Complex inbox management.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Existing app route conventions.
- Existing UI primitives.

## Tasks

- Add minimal notification list route under the authenticated workspace.
- Scope query to current `user_profiles.id`.
- Add mark-read action that repeats recipient check.
- Display unread/read state.
- Link to protected marketplace routes.
- Add empty and error states.
- Avoid adding new dependencies.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Notification list compiles.
- Mark-read action compiles.
- Recipient scoping is enforced in query/action.
- Users cannot read or mutate other users' notifications by direct URL/action.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor UI/action mismatch inside notification list scope.

Hard-stop instead of repairing when:

- UX requires realtime updates, push, email, preferences, or admin tooling.
- Notification links cannot re-check underlying business authorization.
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

- Added `/app/notifications` recipient-scoped notification list.
- Added mark-read server action that repeats recipient ownership check.
- Added read/unread display and protected destination links.
- Added notification entry links to importer and forwarder request workspaces.
- No email, push, realtime, preferences, admin tooling, queue, worker, Redis, or analytics behavior was added.
