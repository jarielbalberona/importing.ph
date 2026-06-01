# Phase 2: Quote Domain Schema Privacy Plan

Status: passed

## Goal

Define and implement quote persistence, status, constraints, indexes, and privacy DTO boundaries.

## Scope

- `db/schema.ts`
- `drizzle/`
- quote validation/types/helpers under `lib/**` if needed
- privacy DTO/query boundary

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- `lib/**` for quote schema/query/DTO helpers
- `.ai/initiatives/quote-submission-privacy/phases/phase-2-quote-domain-schema-privacy-plan.md`
- `.ai/initiatives/quote-submission-privacy/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Quote form UI.
- Quote acceptance/rejection.
- Messaging.
- Notifications.
- Payments.
- Service profile creation.

## Inputs

- Phase 1 report.
- Completed request schema.
- Completed forwarder open request privacy boundary.
- Product privacy rules.

## Tasks

- Define quote status enum.
- Define `quotes` table.
- Decide whether `quote_versions` is needed.
- Define one-active-quote or revision constraints.
- Define indexes for request, forwarder company, and status.
- Define importer quote DTO.
- Define forwarder own-quote DTO.
- Define competitor aggregate DTO.
- Generate and apply migration.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

## Expected Evidence

- Quote schema exists.
- Migration applies.
- Drizzle check passes.
- Type-check passes.
- Privacy DTO boundaries are documented.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Drizzle schema/migration generation drift.
- Minor enum/constraint/index mismatch inside quote scope.

Hard-stop instead of repairing when:

- Migration would be destructive.
- Product decision is required for revisions or multiple active quotes.
- Privacy boundary cannot be enforced in query/DTO shape.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
