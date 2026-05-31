# Phase 2: Quote Comparison Domain Status Plan

Status: pending

## Goal

Define and implement the quote/request status transitions and transactional rules needed for comparison, acceptance, and rejection.

## Scope

- `db/schema.ts`
- `drizzle/`
- quote/request status helpers under `lib/**`
- transition/transaction helpers under `lib/**`

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- `lib/**` for quote comparison/decision helpers
- `.ai/initiatives/importer-quote-comparison/phases/phase-2-quote-comparison-domain-status-plan.md`
- `.ai/initiatives/importer-quote-comparison/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- UI implementation.
- Messaging.
- Notifications.
- Payments.
- Admin tooling.

## Inputs

- Phase 1 report.
- Quote schema and statuses.
- Request schema and statuses.
- Product rules in initiative overview.

## Tasks

- Define comparison DTO.
- Define quote accepted/rejected/non-selected statuses.
- Define request selected status.
- Decide auto-reject behavior for non-selected quotes.
- Define expired quote acceptance behavior.
- Add schema/status changes if needed.
- Define transaction and concurrency strategy.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

## Expected Evidence

- Migration/check passes if schema changed.
- Type-check passes.
- Transition rules are documented.
- Concurrency strategy is documented.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Drizzle schema/migration drift.
- Minor enum/status mismatch inside quote comparison scope.

Hard-stop instead of repairing when:

- Auto-reject behavior needs product decision.
- Expired quote acceptance needs product decision.
- Migration would be destructive.
- Status mapping is ambiguous.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
