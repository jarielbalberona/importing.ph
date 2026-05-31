# Phase 3: Importer UI Action Plan

Status: pending

## Goal

Implement importer quote comparison UI and accept/reject actions on the importer-owned request detail.

## Scope

- Importer request detail route under `app/app/requests`.
- Quote comparison UI.
- Accept/reject server actions.
- Empty, expired, selected, rejected, and submitted states.

Allowed file changes during execution, only if needed:

- `app/app/requests/**`
- `lib/**` for quote comparison/action helpers
- `components/**` for comparison UI extraction if justified
- `.ai/initiatives/importer-quote-comparison/phases/phase-3-importer-ui-action-plan.md`
- `.ai/initiatives/importer-quote-comparison/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Full messaging workflow.
- Notification sending.
- Payment/escrow.
- Admin override.
- Service profile management.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Importer request detail route.
- Quote decision helpers.

## Tasks

- Add quote comparison table/card behavior.
- Show amount, currency, service, transit range, inclusions, exclusions, notes, valid-until, and status.
- Add empty state for no submitted quotes.
- Add expired quote display/handling.
- Add accept interaction.
- Add reject interaction.
- Ensure actions are server-side guarded.
- Keep UI compact and operational.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- UI/actions compile.
- Empty, expired, submitted, accepted, and rejected states are represented.
- Accept/reject actions are guarded.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor UI/action mismatch inside importer quote comparison scope.

Hard-stop instead of repairing when:

- UX/product decision is needed for auto-reject, expired quotes, or unaccept behavior.
- Scope expands to messaging, notifications, payments, or admin tooling.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
