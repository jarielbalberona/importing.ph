# Phase 2: Request Domain And Schema Plan

Status: passed

## Goal

Define and implement the minimal PostgreSQL/Drizzle shipment request domain required for importer-owned request creation.

## Scope

- `db/schema.ts`
- `drizzle/` generated migration files and metadata
- Request-domain validation/types if created near `lib/`
- Phase report and state updates

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- `lib/**` for request schema/validation helpers only
- `.ai/initiatives/shipment-request-wizard/phases/phase-2-request-domain-and-schema-plan.md`
- `.ai/initiatives/shipment-request-wizard/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- UI implementation.
- Forwarder visibility.
- Quotes.
- Messaging.
- File storage.
- Admin tooling.

## Inputs

- Phase 1 report.
- `db/schema.ts`
- `drizzle/`
- `.ai/core/domain-model.md`

## Tasks

- Define request table and explicit enum fields.
- Define required and optional fields.
- Define importer ownership relationship.
- Define indexes for importer list/detail.
- Define request status behavior.
- Generate migration.
- Apply and check migration locally.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

## Expected Evidence

- Request schema exists in Drizzle.
- Migration exists and applies.
- Drizzle check passes.
- Type-check passes.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Drizzle schema/migration generation drift.
- Minor enum/column mismatch inside request schema scope.

Hard-stop instead of repairing when:

- Migration would be destructive.
- Required request fields/enums/statuses are disputed.
- Scope expands to quotes, messaging, file storage, or forwarder browsing.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
