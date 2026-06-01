# Phase 3: Target Database Migration And Safety Plan

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Goal

Define a target-environment migration procedure that prevents accidental destructive or wrong-database execution.

## Scope

- Inspect Drizzle migration history.
- Define target `DATABASE_URL` confirmation checklist.
- Define migration/check command sequence.
- Define backup/snapshot expectation.
- Define hard-stop criteria for drift.

## Out Of Scope

- Running production/staging migrations during planning.
- Dropping, resetting, truncating, or pushing schema to production.
- Using `db:push` against target deployment.
- Creating a new database architecture.

## Inputs

- `drizzle/`
- `drizzle.config.ts`
- `db/schema.ts`
- `package.json`
- `render.yaml`
- Render database configuration, if available during execution.

## Tasks

- List existing migration files.
- Confirm migration path uses `npm run db:migrate`.
- Define target confirmation command/check.
- Define `npm run db:check` expectation after migration.
- Define backup/snapshot requirement before target migration where platform supports it.
- Define drift/destructive hard stops.

## Verification Commands

- `find drizzle -maxdepth 2 -type f | sort`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run db:check`
- `git diff --check -- .ai/initiatives/production-readiness-admin-runbook .ai/state`

## Expected Evidence

- Phase report includes target DB safety procedure.
- No production/staging DB command is run unless the target is explicitly confirmed in that phase.
- `db:push` is forbidden for target deployment unless a human explicitly overrides after reviewing drift.

## Repair Policy

Allowed repairs:

- Fix markdown/runbook clarity.
- Fix local command documentation.

Hard-stop for ambiguous target DB, destructive drift, missing backup expectation, or any command that could affect a non-local DB without confirmation.

## Completion Notes

Phase 3 completed on `2026-06-01`.

Observed migration truth:

- Migration history exists from `drizzle/0000_large_scalphunter.sql` through `drizzle/0007_dry_firebird.sql`.
- Current migrations create profile tables, request table, quote table, quote/request status additions, conversations/messages, notifications, and forwarder-company suspension fields.
- Current checked migration SQL is additive from repo inspection.
- Local explicit-target `npm run db:check` passes against `localhost:55432/importing_ph_dev`.

Target migration runbook:

1. Confirm environment name: staging or production.
2. Confirm service/deployment URL.
3. Confirm exact target `DATABASE_URL` host and database name from Render/operator source.
4. Confirm target is not local dev and not a personal database.
5. Confirm backup/snapshot availability or explicit rollback posture before migration.
6. Run `npm run db:migrate` only with the confirmed target environment.
7. Run `npm run db:check` only with the confirmed target environment.
8. Record command output and Render/database evidence.

Hard stops:

- Do not use `db:push` against staging/production.
- Do not run migration/check against an implicit `DATABASE_URL`.
- Stop for destructive drift or uncertain migration output.
- Stop if backup/snapshot posture is unknown for production.
