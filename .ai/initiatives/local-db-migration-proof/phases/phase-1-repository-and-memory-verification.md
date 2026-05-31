# Phase 1: Repository And Memory Verification

Status: passed_with_issues

## Goal

Establish the current repo and memory baseline for local DB proof without changing application code.

## Scope

- Read memory and state files.
- Inspect local DB, Drizzle, env, migration, script, and npm command files.
- Produce a phase report with current baseline and gaps.

Allowed file changes during execution:

- `.ai/initiatives/local-db-migration-proof/phases/phase-1-repository-and-memory-verification.md`
- `.ai/initiatives/local-db-migration-proof/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Database schema changes.
- Migration changes.
- Script changes.
- Docker Compose changes.
- Package script changes.
- Initiative scope expansion.

## Inputs

- `AGENTS.md`
- `.ai/README.md`
- `.ai/core/*`
- `.ai/state/*`
- `package.json`
- `package-lock.json`
- `docker-compose.yml`
- `.env.example`
- `.env.local.example`
- `drizzle.config.ts`
- `db/index.ts`
- `db/schema.ts`
- `drizzle/`
- `scripts/db-smoke.ts`
- `scripts/prove-onboarding.ts`

## Tasks

- Confirm current package manager and available npm scripts.
- Confirm local Docker Compose Postgres settings.
- Confirm env example contains local `DATABASE_URL`.
- Confirm Drizzle config and DB client env loading behavior.
- Confirm current schema tables and migration files.
- Confirm DB smoke and onboarding proof scripts exist.
- Record gaps and risks in the phase report.
- Update required state files according to the execution skill.

## Verification Commands

- `git status --short`
- `test -f package.json`
- `test -f docker-compose.yml`
- `test -f drizzle.config.ts`
- `test -f db/schema.ts`
- `test -f scripts/db-smoke.ts`
- `test -f scripts/prove-onboarding.ts`
- `test -d drizzle`

## Expected Evidence

- Dirty worktree classified before execution changes.
- Required files and directories exist.
- Phase report records current npm scripts, Compose settings, env expectation, schema tables, migration files, and script availability.
- No application code changed.

## Repair Policy

Allowed repairs:

- Fix only initiative report/status wording if the phase report is incomplete or inconsistent.

Hard-stop instead of repairing when:

- Required repo files are missing.
- Repo state contradicts the initiative objective.
- The phase would require application, schema, package, or infrastructure changes.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
