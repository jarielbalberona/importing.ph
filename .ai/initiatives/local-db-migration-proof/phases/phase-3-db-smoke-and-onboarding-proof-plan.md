# Phase 3: DB Smoke And Onboarding Proof Plan

Status: pending

## Goal

Validate or minimally harden the local DB smoke and onboarding insert/read/cleanup proof for core profile tables.

## Scope

- `scripts/db-smoke.ts`
- `scripts/prove-onboarding.ts`
- `lib/onboarding.ts` only as a read dependency unless a tiny proof-blocking import or type issue must be fixed.
- `db/schema.ts` only as a read dependency unless a proof-blocking mismatch is discovered and is safe to fix.
- Required profile tables:
  - `user_profiles`
  - `importer_profiles`
  - `forwarder_companies`
  - `forwarder_members`

Allowed file changes during execution, only if needed:

- `scripts/db-smoke.ts`
- `scripts/prove-onboarding.ts`
- `.ai/initiatives/local-db-migration-proof/phases/phase-3-db-smoke-and-onboarding-proof-plan.md`
- `.ai/initiatives/local-db-migration-proof/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Clerk setup changes.
- Onboarding product flow changes.
- Marketplace feature code.
- New tables unless Phase 2 proved the current profile schema itself is inconsistent.
- External service calls.

## Inputs

- Phase 1 report.
- Phase 2 report.
- `scripts/db-smoke.ts`
- `scripts/prove-onboarding.ts`
- `lib/onboarding.ts`
- `db/index.ts`
- `db/schema.ts`

## Tasks

- Confirm smoke script checks all required profile tables.
- Run DB smoke script.
- Confirm onboarding proof creates importer and forwarder paths through existing onboarding logic.
- Confirm proof rows are read back.
- Confirm proof rows are cleaned up by generated Clerk user ids.
- Confirm proof refuses production execution.
- If a script fails because of a narrow proof bug, apply the smallest fix and rerun.
- Record exact command evidence and any repairs in the phase report.
- Update required state files according to the execution skill.

## Verification Commands

- `npm run db:smoke`
- `npm run db:prove-onboarding`

## Expected Evidence

- `npm run db:smoke` exits `0`.
- Smoke output includes `DB smoke PASS`.
- Smoke output includes required table names.
- `npm run db:prove-onboarding` exits `0`.
- Onboarding proof output includes `Onboarding proof PASS`.
- Onboarding proof output includes importer and forwarder IDs.
- Report confirms cleanup behavior or documents residual rows as an active risk.

## Repair Policy

Allowed repairs:

- Missing required table in smoke script table list.
- Proof script cleanup bug.
- Proof script connection cleanup bug.
- Minor type/import issue in proof scripts.

Hard-stop instead of repairing when:

- Proof requires real Clerk API calls.
- Proof cannot safely clean generated rows.
- Proof would touch production data.
- Fix requires changing onboarding product behavior.
- Fix requires adding marketplace schema.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
