# Current State

Initialized local AI memory for `importing.ph` on `2026-05-31`.

Before executing an initiative phase, read relevant `.ai/core` files, this state file, `known-risks.md`, `verification-status.md`, the initiative overview, and the current phase file.

## Initiatives

- `local-db-migration-proof`: active initiative.
  - Phase 1 `phase-1-repository-and-memory-verification`: `passed_with_issues`.
  - Phase 2 `phase-2-local-db-migration-proof-plan`: `passed`.
  - Phase 3 `phase-3-db-smoke-and-onboarding-proof-plan`: `passed`.
  - Phase 4 `phase-4-final-verification-and-handoff`: `passed_with_issues`.
  - Final report: `reports/final-report.md`.
  - Final verdict: `PASS WITH ISSUES`.
  - Phase 1 verified repository and memory baseline for local PostgreSQL, Drizzle, env loading, migrations, package scripts, and proof scripts.
  - Phase 2 proved Docker Compose config, running local Postgres health, `npm run db:migrate`, and `npm run db:check` against `localhost:55432/importing_ph_dev`.
  - Phase 3 proved `npm run db:smoke`, `npm run db:prove-onboarding`, and generated proof user cleanup against `localhost:55432/importing_ph_dev`.
  - Phase 4 proved the final ordered verification sequence; one transient type-check failure caused by parallel `.next` generation was accepted after sequential rerun passed.
  - Confirmed local development database target for later DB phases: `localhost:55432/importing_ph_dev`.
  - No application feature code, schema, migration file, Docker, or package script changes were made.
  - Next recommended initiative after human acceptance: `auth-onboarding-roles`.
- `auth-onboarding-roles`: active initiative.
  - Phase 1 `phase-1-current-auth-onboarding-audit`: `passed`.
  - Phase 2 `phase-2-importer-onboarding-hardening`: `passed`.
  - Phase 3 `phase-3-forwarder-onboarding-hardening`: `passed`.
  - Phase 4 `phase-4-role-guards-and-redirects`: `passed`.
  - Phase 5 `phase-5-verification-and-browser-smoke`: `blocked`.
  - Dependency `local-db-migration-proof` is complete with final report and accepted `PASS WITH ISSUES` verdict.
  - Phase 1 audited Clerk routes, middleware, onboarding form/action, PostgreSQL profile writes, route destinations, role guards, proof routes, and admin route truth.
  - Phase 2 added importer retry/idempotency proof to `scripts/prove-onboarding.ts` and verified importer retries do not create duplicate rows or switch role.
  - Phase 3 added forwarder retry/idempotency proof to `scripts/prove-onboarding.ts` and verified forwarder retries do not create duplicate memberships or switch role.
  - Phase 4 verified Clerk middleware, database-backed page role guards, role destinations, wrong-role redirect behavior, and admin route truth.
  - Phase 5 final automated commands passed sequentially, but browser smoke is blocked because the in-app browser has an existing Clerk session with no PostgreSQL profile and no confirmed disposable Clerk test account or isolated auth smoke database is available.
  - In-app browser evidence confirmed that the current signed-in profile-less session redirects from `/after-auth`, `/app/requests`, `/app/forwarder/requests`, and `/admin` to `/onboarding`; onboarding form submission was not performed against the development database.
  - Current wrong-role behavior redirects users to their own role destination instead of `/unauthorized`.
  - Admin role/route exists, but admin provisioning is not implemented.
  - Final initiative report has not been written.
  - Next required action: provide disposable local Clerk test accounts and an isolated auth smoke database setup, then rerun Phase 5 browser smoke.
