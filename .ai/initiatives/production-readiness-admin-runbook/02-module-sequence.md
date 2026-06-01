# Module Sequence

## Phase 1: Deployment And Environment Audit

Read and document:

- `render.yaml`
- `package.json`
- `.env.example`
- `.env.local.example`
- `drizzle.config.ts`
- `docker-compose.yml`
- `proxy.ts`
- `db/index.ts`
- relevant Clerk route/config usage
- current final reports and `.ai/core/*`

Output should be a factual baseline, not a deployment tutorial invented from memory.

## Phase 2: Admin Provisioning Runbook

Inspect:

- `db/schema.ts`
- `lib/authz.ts`
- `lib/admin.ts`
- `app/admin/**`
- existing scripts under `scripts/`

Define the smallest safe admin path:

- identify or create the Clerk user outside public onboarding.
- insert/update PostgreSQL `user_profiles.role = "admin"` through an operator-controlled procedure.
- verify `/admin`.
- remove/revert accidental admin access.

If a script is planned, execution must keep it explicit and safe. Public admin registration is out of scope.

## Phase 3: Target Database Migration And Safety Plan

Use Drizzle and current migration history only.

Define:

- exact target DB confirmation step.
- migration command for target environment.
- schema check command for target environment.
- backup/snapshot expectation if the target platform supports it.
- hard stop for destructive or ambiguous drift.

Do not run production/staging migrations unless a human explicitly provides and confirms the target.

## Phase 4: Deployed Smoke Test Plan

Define end-to-end deployed smoke for:

- signed-out redirects.
- importer onboarding/session.
- forwarder onboarding/session.
- wrong-role `/unauthorized`.
- request creation.
- forwarder browsing.
- quote privacy matrix.
- quote comparison and accept/reject.
- quote-gated messaging.
- notification creation/read behavior.
- admin access.
- forwarder-company suspension.

Use disposable accounts and exact cleanup. If production cannot support safe cleanup, stop.

## Phase 5: Rollback, Monitoring, And Launch-Readiness Handoff

Define:

- rollback/debug checklist.
- logs to inspect.
- minimum monitoring expectations.
- go/no-go checklist.
- launch status category.
- deferred work that must not be snuck into production readiness.

This phase produces the handoff for controlled beta or states why the project is still local/staging-only.

