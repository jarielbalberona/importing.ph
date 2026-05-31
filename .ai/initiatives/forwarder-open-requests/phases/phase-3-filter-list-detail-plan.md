# Phase 3: Filter List Detail Plan

Status: pending

## Goal

Implement forwarder open request list/detail views with filters for available request fields.

## Scope

- `app/app/forwarder/requests/page.tsx`
- Forwarder request detail route under `app/app/forwarder/requests`
- Filter parsing and query helpers
- Database indexes if needed for filtering
- Empty and not-found states

Allowed file changes during execution, only if needed:

- `app/app/forwarder/requests/**`
- `lib/**` for request query/filter helpers
- `db/schema.ts`
- `drizzle/**`
- `components/**` for local UI extraction if justified
- `.ai/initiatives/forwarder-open-requests/phases/phase-3-filter-list-detail-plan.md`
- `.ai/initiatives/forwarder-open-requests/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Quote submission.
- Quote comparison.
- Messaging.
- Notifications.
- File upload storage.
- Public SEO pages.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Completed shipment request schema.
- Existing forwarder proof route.

## Tasks

- Replace forwarder proof page with open request list behavior.
- Add request detail route.
- Add filters for available fields.
- Exclude non-open/non-posted requests.
- Add empty state.
- Add not-found behavior for unavailable request detail.
- Add indexes if query pattern needs them.
- Do not fake unavailable filters.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Migration/check passes if indexes changed.
- Type-check passes.
- Lint passes.
- List/detail compile.
- Non-open requests are filtered out.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor filter/query/index mismatch inside scope.
- Generated migration drift for indexes.

Hard-stop instead of repairing when:

- Required filters need fields not present in shipment request schema.
- Schema change would be destructive.
- Scope expands to quotes, messaging, notifications, or file storage.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
