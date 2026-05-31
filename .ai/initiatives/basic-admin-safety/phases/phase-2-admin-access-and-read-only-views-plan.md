# Phase 2: Admin Access And Read-Only Views Plan

Status: pending

## Goal

Implement minimal admin-only read views for users/profiles, requests, quotes, and reports if reports exist.

## Scope

- Admin route boundaries.
- User/profile read view.
- Shipment request read view.
- Quote read view.
- Report read view only if reports exist or are added later.
- Admin-only query helpers if useful.

Allowed file changes during execution, only if needed:

- `app/admin/**`
- `lib/**` for admin query helpers
- `components/**` for small reusable UI only if justified
- `.ai/initiatives/basic-admin-safety/phases/phase-2-admin-access-and-read-only-views-plan.md`
- `.ai/initiatives/basic-admin-safety/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Suspension writes.
- Report creation.
- Full CRM/support dashboard.
- Analytics.
- Admin impersonation.
- Clerk account management.

## Inputs

- Phase 1 report.
- Completed request schema/routes.
- Completed quote schema/routes.
- Current admin route.
- Product privacy rules.

## Tasks

- Confirm every admin page/action is guarded by admin role.
- Add minimal user/profile list/detail.
- Add minimal request list/detail.
- Add minimal quote list/detail.
- Add report read view only if reports already exist.
- Ensure admin DTOs do not alter importer/forwarder DTOs.
- Keep UI compact and operational.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Admin read views compile.
- Admin guard is present.
- Non-admin behavior is documented.
- No mutation behavior is introduced in this phase.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor query/UI mismatch inside admin read scope.

Hard-stop instead of repairing when:

- Admin quote visibility conflicts with privacy rules.
- Product asks for CRM/support dashboard behavior.
- Required request/quote schemas are absent.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Filled by the execution skill or runner.
