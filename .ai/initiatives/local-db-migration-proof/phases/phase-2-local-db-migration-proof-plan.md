# Phase 2: Local DB Migration Proof Plan

Status: pending

## Goal

Validate or minimally harden the local Docker Compose, environment, Drizzle migration, and schema-check path.

## Scope

- Local Docker Compose expectations.
- Local `DATABASE_URL` expectations.
- Drizzle migration execution.
- Drizzle schema check execution.
- Minimal local proof hardening only if required.

Allowed file changes during execution, only if needed:

- `docker-compose.yml`
- `.env.example`
- `.env.local.example`
- `drizzle.config.ts`
- `db/index.ts`
- `.ai/initiatives/local-db-migration-proof/phases/phase-2-local-db-migration-proof-plan.md`
- `.ai/initiatives/local-db-migration-proof/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Production Render database changes.
- New database infrastructure.
- Schema expansion for marketplace features.
- Shipment request or quote tables.
- Package manager changes.
- Prisma, Express, queues, Redis, WebSockets, Terraform, or AWS.

## Inputs

- Phase 1 report.
- `docker-compose.yml`
- `.env.example`
- `.env.local.example`
- `drizzle.config.ts`
- `db/index.ts`
- `drizzle/`
- `package.json`

## Tasks

- Confirm Docker Compose config renders successfully.
- Confirm local database target is `localhost:55432/importing_ph_dev` or document the current safe local equivalent.
- Confirm migration command is `npm run db:migrate`.
- Confirm schema check command is `npm run db:check`.
- Run migration and schema check.
- If migration/check fails because of local config drift, apply the smallest local-only fix and rerun.
- Record exact command evidence and any repairs in the phase report.
- Update required state files according to the execution skill.

## Verification Commands

- `docker compose config`
- `npm run db:migrate`
- `npm run db:check`

## Expected Evidence

- Compose config exits `0`.
- Migration exits `0`.
- Drizzle check exits `0`.
- Report identifies the DB target class without exposing secrets.
- Any repairs are limited to local DB proof files.

## Repair Policy

Allowed repairs:

- Local Compose configuration drift.
- Env example mismatch.
- Drizzle config env-loading mismatch.
- DB client env-loading mismatch.
- Generated file drift only if directly caused by Drizzle proof commands.

Hard-stop instead of repairing when:

- `DATABASE_URL` points at production or an unknown remote database.
- Migration would require destructive schema changes.
- Fix requires production Render changes.
- Fix requires changing Clerk behavior.
- Fix requires adding unrelated infrastructure or marketplace schema.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
