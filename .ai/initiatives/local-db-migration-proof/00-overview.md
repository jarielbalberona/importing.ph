# Local DB Migration Proof

## Initiative Key

`local-db-migration-proof`

## Dependencies

depends_on: []

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Latest execution status: completed with issues; see `reports/final-report.md`.

Lifecycle rule: this initiative is authored for review first. Lock it only after a human confirms the plan and the executor is allowed to run local DB commands.

## Objective

Prove that Importing.ph has a reliable local database foundation before marketplace feature work continues.

The proof must cover local PostgreSQL through Docker Compose, Drizzle migration execution, Drizzle schema checks, database connectivity, and insert/read coverage for the onboarding-related profile tables already present in the repository.

This is foundation work. It does not implement marketplace features.

## Repo Baseline Observed During Authoring

- Package manager is `npm`; `package-lock.json` exists.
- Local PostgreSQL is defined in `docker-compose.yml` using `postgres:16-alpine`.
- The current Compose host port is `55432:5432`.
- The local database name is `importing_ph_dev`.
- The local database user is `importing_ph`.
- The local example `DATABASE_URL` is `postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`.
- Drizzle config is `drizzle.config.ts`.
- Drizzle schema is `db/schema.ts`.
- Generated migrations live under `drizzle/`.
- Existing migration `drizzle/0000_large_scalphunter.sql` creates `user_role`, `user_profiles`, `importer_profiles`, `forwarder_companies`, and `forwarder_members`.
- Database client setup is in `db/index.ts`.
- Existing proof scripts are `scripts/db-smoke.ts` and `scripts/prove-onboarding.ts`.
- Existing npm scripts include `db:migrate`, `db:check`, `db:smoke`, `db:prove-onboarding`, `type-check`, `lint`, and `build`.

## Scope

- Verify current local DB and migration setup against repository files.
- Confirm local `DATABASE_URL` expectations.
- Confirm migrations can run against the local Docker Compose database.
- Confirm Drizzle schema checks can run.
- Confirm DB smoke/proof scripts are present and adequate, or define minimal follow-up changes if they are not.
- Prove the following tables can be created, detected, inserted into through onboarding logic, read back, and cleaned up:
  - `user_profiles`
  - `importer_profiles`
  - `forwarder_companies`
  - `forwarder_members`
- Document exact verification commands and expected evidence.
- Document current repo gaps discovered during execution.

## Non-Goals

- Do not implement shipment requests.
- Do not implement quote submission.
- Do not implement messaging.
- Do not modify Clerk setup.
- Do not modify onboarding logic unless a proof script cannot run without a minimal, explicitly justified fix.
- Do not add production database infrastructure.
- Do not change Render deployment unless a current repository contradiction blocks local proof and a human approves the scope change.
- Do not introduce pnpm, Prisma, Express, AWS, Terraform, queues, Redis, WebSockets, React Query, Zustand, or microservices.
- Do not create fake integrations or placeholder marketplace code.

## Acceptance Criteria

- Phase 1 produces a repo-truth baseline for local DB, Drizzle, env, migrations, scripts, and known gaps.
- Phase 2 proves or minimally hardens the local Docker Compose and Drizzle migration path.
- Phase 3 proves the profile-table smoke and onboarding insert/read/cleanup path.
- Phase 4 runs or records the full verification sequence:
  - `npm run db:migrate`
  - `npm run db:check`
  - `npm run db:smoke`
  - `npm run db:prove-onboarding`
  - `npm run type-check`
  - `npm run lint`
  - `npm run build`
- Every command result is recorded with exact command strings and concise evidence in phase reports.
- No marketplace feature code is added by this initiative.
- No production infrastructure is added by this initiative.

## Domain Model

- Local PostgreSQL database: the Docker Compose-backed development database.
- Migration: Drizzle-generated SQL applied by `npm run db:migrate`.
- Schema check: Drizzle Kit validation via `npm run db:check`.
- DB smoke check: table and connectivity proof via `npm run db:smoke`.
- Onboarding proof: insert/read/cleanup proof via `npm run db:prove-onboarding`.
- Core profile tables: `user_profiles`, `importer_profiles`, `forwarder_companies`, and `forwarder_members`.

## Module Sequence

1. Verify repository and memory baseline.
2. Validate or minimally harden local Docker Compose, env, Drizzle config, and migration expectations.
3. Validate or minimally harden DB smoke and onboarding proof scripts.
4. Run final verification and hand off the result.

## Cross-Module Data Flow

```text
.env.local or .env
-> DATABASE_URL
-> drizzle.config.ts
-> drizzle/ migrations
-> local PostgreSQL container
```

```text
.env.local or .env
-> db/index.ts
-> scripts/db-smoke.ts
-> information_schema table checks
```

```text
.env.local or .env
-> db/index.ts
-> scripts/prove-onboarding.ts
-> lib/onboarding.ts
-> user_profiles/importer_profiles/forwarder_companies/forwarder_members
-> cleanup by generated Clerk user ids
```

## Verification Plan

Final verification commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run db:smoke`
- `npm run db:prove-onboarding`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected final evidence:

- Migrations apply against the local Docker Compose database.
- Drizzle check exits successfully.
- DB smoke reports `DB smoke PASS` and lists all required tables.
- Onboarding proof reports `Onboarding proof PASS` and prints inserted IDs before cleanup.
- Type-check, lint, and build exit successfully.

## Hard Stops

Stop for human input if any of these occur:

- Local `DATABASE_URL` points at production or an unknown remote database.
- Docker Compose configuration would overwrite or destroy existing data unexpectedly.
- Migration execution requires destructive schema changes.
- Existing migration metadata appears inconsistent with `db/schema.ts`.
- DB proof requires changing Clerk auth behavior.
- Proof requires production Render changes.
- The same verification failure remains after three bounded repair attempts.
