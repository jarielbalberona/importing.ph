# Module Sequence

## Phase 1: Repository And Memory Verification

Read and report current truth from:

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

Output:

- Baseline summary in the phase report.
- List of discovered gaps or contradictions.
- No app code changes.

## Phase 2: Local DB And Migration Proof Plan

Validate or minimally harden the local DB migration path.

Expected order:

1. Confirm Docker Compose local Postgres expectations.
2. Confirm local `DATABASE_URL` points to the Compose database.
3. Confirm Drizzle loads env cleanly.
4. Confirm `npm run db:migrate` is the canonical local migration command.
5. Confirm `npm run db:check` is the canonical schema check command.
6. If a minimal repo fix is required, keep it limited to local DB config, env examples, Drizzle config, or scripts directly required for proof.

Output:

- Exact migration/check commands and expected evidence.
- Any minimal changes required for local proof.
- No production infra changes.

## Phase 3: DB Smoke And Onboarding Proof Plan

Validate or minimally harden table smoke and insert/read/cleanup proof.

Expected order:

1. Confirm `scripts/db-smoke.ts` checks all required profile tables.
2. Confirm `scripts/prove-onboarding.ts` creates importer and forwarder paths.
3. Confirm proof rows are read back after insertion.
4. Confirm generated rows are cleaned up.
5. Confirm the proof refuses production execution.
6. If a minimal repo fix is required, keep it limited to proof scripts and directly related imports.

Output:

- Exact smoke/proof commands and expected evidence.
- Any residual data safety limitations.
- No marketplace feature code.

## Phase 4: Final Verification And Handoff

Run final verification in order:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run db:smoke`
4. `npm run db:prove-onboarding`
5. `npm run type-check`
6. `npm run lint`
7. `npm run build`

Output:

- Final phase report.
- Updated execution state files as required by the execution skill.
- `reports/final-report.md` with final verdict.
- Clear handoff stating whether marketplace feature initiatives can proceed.
