# Verification Plan

## Verification Philosophy

This initiative is not complete because files exist. It is complete only when the local database path is proven with command evidence.

No command should be reported as passing unless it was run in the phase and the result was recorded in the phase report.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f package.json`
- `test -f docker-compose.yml`
- `test -f drizzle.config.ts`
- `test -f db/schema.ts`
- `test -f scripts/db-smoke.ts`
- `test -f scripts/prove-onboarding.ts`
- `test -d drizzle`

Expected evidence:

- Current dirty worktree is classified before execution changes.
- Required DB/config/script files exist.
- Current baseline is recorded without modifying application code.

## Phase 2 Verification

Commands:

- `docker compose config`
- `npm run db:migrate`
- `npm run db:check`

Expected evidence:

- Compose config renders successfully.
- Migration command exits `0`.
- Schema check command exits `0`.
- The report records the exact `DATABASE_URL` target class without exposing secrets. Example acceptable wording: `localhost:55432/importing_ph_dev`.

Hard stop:

- Stop if `DATABASE_URL` targets production or an unknown remote database.
- Stop if migration proposes destructive changes.

## Phase 3 Verification

Commands:

- `npm run db:smoke`
- `npm run db:prove-onboarding`

Expected evidence:

- DB smoke prints `DB smoke PASS`.
- DB smoke output includes database, user, and required table list.
- Onboarding proof prints `Onboarding proof PASS`.
- Onboarding proof prints generated importer and forwarder IDs.
- Proof cleanup runs after successful inserts.

Hard stop:

- Stop if proof would require real Clerk API calls.
- Stop if generated proof rows cannot be safely cleaned up.

## Phase 4 Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run db:smoke`
- `npm run db:prove-onboarding`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`.
- Any skipped command has a concrete reason and impact.
- Final report states whether local DB/migration proof passed, passed with issues, or failed.
- Final handoff states whether marketplace feature initiatives can proceed.

## Manual Confirmation Steps

- Confirm Docker is available before DB phases.
- Confirm local `.env.local` or `.env` contains a local `DATABASE_URL`.
- Confirm no production database URL is used.
- Confirm no marketplace application code was added by this initiative.

## Done Criteria

- All four phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- `.ai/state/current-state.md`, `.ai/state/known-risks.md`, and `.ai/state/verification-status.md` reflect final execution state.
- `decisions.md` is updated only if execution creates a durable project decision.

## Database Target And Isolation Rules

The active local development database is:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Development database is acceptable for this initiative's non-destructive migration, schema check, `db:smoke`, and `db:prove-onboarding` proof because this initiative exists to prove local development database behavior.

Use a dedicated test database if a phase introduces destructive reset, repeatable fixture isolation, or cleanup beyond the current proof script behavior:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_local_db_migration_proof_test
```

Requirements:

- Run migrations against whichever local target is used: `DATABASE_URL=<target> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<target> npm run db:check`.
- `db:prove-onboarding` must seed generated importer/forwarder rows and clean them up by generated Clerk ids.
- Any new smoke script planned in execution must document setup/reset/cleanup and must refuse non-local `DATABASE_URL` values.
- Never run destructive reset, fixture cleanup, or generated smoke data against a non-local database.

## Dedicated Step-By-Step DB Smoke Tests

### Local Migration And Schema Check

1. Account/role: none.
2. Route: none.
3. Command: `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`.
4. Expected database state: migrations table reflects applied migrations; no destructive drift.
5. Command: `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`.
6. Expected result: schema check exits `0`.
7. Pass/fail: pass only if both commands succeed against localhost port `55432`.

### DB Smoke Script

1. Account/role: none.
2. Route: none.
3. Command: `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:smoke`.
4. Expected database state: required profile tables exist.
5. Expected output: `DB smoke PASS`.
6. Pass/fail: pass only if required tables are detected.

### Onboarding Proof Script

1. Account/role: generated importer and forwarder proof identities.
2. Route: none.
3. Command: `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:prove-onboarding`.
4. Expected database state: temporary `user_profiles`, `importer_profiles`, `forwarder_companies`, and `forwarder_members` rows are inserted and then cleaned up.
5. Expected output: `Onboarding proof PASS`.
6. Pass/fail: pass only if insert/read/cleanup all complete.
