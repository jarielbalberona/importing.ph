# Phase 4: Privacy And Authorization Plan

Status: passed

## Goal

Verify and harden importer owner access, forwarder own-quote access, competitor restrictions, and direct URL/action abuse cases.

## Scope

- Importer owner quote visibility.
- Non-owner importer denial.
- Forwarder own-quote visibility after status changes.
- Competitor forwarder restricted visibility.
- Direct URL/action abuse cases.

Allowed file changes during execution, only if needed:

- `app/app/requests/**`
- `app/app/forwarder/requests/**`
- `lib/**` for quote visibility/authorization helpers
- `.ai/initiatives/importer-quote-comparison/phases/phase-4-privacy-and-authorization-plan.md`
- `.ai/initiatives/importer-quote-comparison/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New public routes.
- Admin visibility.
- Messaging.
- Notifications.
- Payment/escrow.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Quote privacy helpers from `quote-submission-privacy`.

## Tasks

- Verify importer owner can access all quotes on owned request.
- Verify non-owner importer cannot access quote details.
- Verify submitting forwarder can still see own quote and own quote status.
- Verify competitor forwarder cannot see quote details or selected quote identity.
- Verify direct URL/action abuse is blocked.
- Verify status changes do not leak competitor details.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Type-check passes.
- Lint passes.
- Privacy matrix is recorded.
- Abuse cases are documented and handled.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing guard.
- Minor query/DTO mismatch inside privacy scope.

Hard-stop instead of repairing when:

- Privacy boundary is ambiguous.
- Fix requires public routes, admin tooling, or messaging scope.
- Competitor forwarder would see quote details.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
