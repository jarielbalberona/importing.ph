# Phase 4: Final Verification And Handoff

Status: pending

## Goal

Run the complete local DB and application verification sequence and produce the final handoff.

## Scope

- Final verification command execution.
- Final phase report.
- Final initiative report.
- State file updates required by the execution skill.

Allowed file changes during execution:

- `.ai/initiatives/local-db-migration-proof/phases/phase-4-final-verification-and-handoff.md`
- `.ai/initiatives/local-db-migration-proof/reports/*`
- `.ai/initiatives/local-db-migration-proof/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New application code.
- New database schema.
- New migrations.
- Docker Compose changes.
- Package script changes.
- Marketplace feature implementation.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Current working tree status.
- `.ai/README.md`
- `.agent/skills/project-memory-execution/SKILL.md`

## Tasks

- Run the final verification commands in order.
- Record exact pass/fail/skipped evidence for every command.
- Classify any unrelated dirty worktree state.
- Create `reports/final-report.md`.
- Update initiative lifecycle metadata if execution completes.
- Update required state files according to the execution skill.
- State whether marketplace feature initiatives can proceed.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run db:smoke`
- `npm run db:prove-onboarding`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Expected Evidence

- All commands exit `0`, or skipped/failed commands are documented with exact reason and impact.
- Final report contains `PASS`, `PASS WITH ISSUES`, or `FAIL`.
- Final report confirms whether local DB/migration proof is reliable enough for feature work.
- No marketplace feature code changed.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Build failures.
- Missing imports.
- Formatting issues.
- Generated file drift.
- Minor contract mismatches inside this initiative's local DB proof scope.

Hard-stop instead of repairing when:

- Failure requires product decisions.
- Failure requires authentication behavior changes.
- Failure requires destructive database changes.
- Failure requires production infrastructure changes.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
