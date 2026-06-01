# Production Readiness Admin Runbook

## Initiative Key

`production-readiness-admin-runbook`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles, shipment-request-wizard, forwarder-open-requests, quote-submission-privacy, importer-quote-comparison, quote-gated-messaging, notification-records, basic-admin-safety, v1-hardening-launch-readiness

Dependency rule: do not begin execution unless every dependency has a final report with `PASS` or accepted `PASS WITH ISSUES`, `.ai/core/*` remains aligned to current implementation truth, and no dependency is blocked or failed.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Execution complete: yes
- Latest execution status: Phase 5 `passed_with_issues`.
- Final verdict: `PASS WITH ISSUES`.

Lifecycle rule: this initiative was reviewed and locked for execution on `2026-06-01`. Execution must stay inside the production-readiness/admin-runbook scope and must not expand product behavior.

## Objective

Create the production-readiness, admin-provisioning, deployment, and smoke-test runbook needed to prove the implemented Importing.ph V1 marketplace loop on the target deployment without expanding product scope.

The goal is operational proof, not new product behavior.

## Repository Truth Used

Observed current implementation:

- V1 marketplace loop is implemented and locally smoke-proven through `v1-hardening-launch-readiness`.
- App is a single Next.js App Router application.
- PostgreSQL and Drizzle own business data and migrations.
- Clerk is authentication only.
- Render config exists in `render.yaml`.
- Local database is Docker Compose PostgreSQL on `localhost:55432/importing_ph_dev`.
- Admin routes exist under `/admin`.
- Admin provisioning is manual/seeded; no product UI or script currently creates admins.
- In-app DB notifications exist; email/Resend delivery is deferred.

Observed deployment config:

- `render.yaml` defines one Render web service named `importing-ph`.
- Render build command is `npm ci && npm run build`.
- Render start command is `npm run start`.
- Render Node version env is `22`.
- Render database is named `importing-ph-db`.
- `DATABASE_URL` is sourced from the Render database connection string.
- Clerk env vars are required and not synced in repo.

## Scope

- Audit deployment, env, database, Clerk, and admin assumptions.
- Define production/staging environment variable requirements.
- Define target database migration procedure with explicit target confirmation.
- Define safe admin provisioning and rollback/removal procedure.
- Define non-destructive deployed smoke tests for the implemented V1 loop.
- Define disposable Clerk test-user handling for deployed environments.
- Define quote privacy, messaging gate, notification, and suspension proof in deployment.
- Define smoke data cleanup strategy.
- Define rollback/debug checklist.
- Define minimum operational logging/monitoring expectations.
- Define launch-readiness status categories.
- Document deferred work after production readiness.

## Non-Goals

- Do not implement application code during initiative authoring.
- Do not build public SEO pages.
- Do not build payments, escrow, shipment tracking, reviews, ratings, analytics dashboards, AI recommendations, logistics ERP, warehouse tools, or forwarder operations tooling.
- Do not add realtime, WebSockets, queues, event buses, Redis, workers, or cron-heavy infrastructure.
- Do not add Prisma, Express, AWS/ECS/Terraform, microservices, or a package-manager migration.
- Do not productize public admin self-registration unless execution proves it is the smallest safe path and a human approves it.
- Do not implement full email/Resend delivery unless future product memory explicitly requires it.

## Acceptance Criteria

- Current deployment assumptions are documented from repo evidence.
- Required production/staging env vars are listed with source/owner and verification method.
- Admin provisioning has an operator-controlled process that does not expose public admin registration.
- Target DB migration procedure requires explicit target confirmation before any migration.
- Destructive migration drift and ambiguous database targets are hard stops.
- Deployed smoke tests are step-by-step, non-destructive, and include cleanup.
- Quote privacy matrix is required in deployment before any controlled beta claim.
- Messaging gate and participant privacy are required in deployment.
- Notification records and recipient scoping are required in deployment.
- Admin access and forwarder-company suspension are required in deployment.
- Launch status categories separate local validation, staging smoke, controlled beta, and public launch.

## Phase Breakdown

1. Deployment and environment audit.
2. Admin provisioning runbook.
3. Target database migration and safety plan.
4. Deployed smoke test plan.
5. Rollback, monitoring, and launch-readiness handoff.

## Verification Plan

Local static verification for execution phases:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
```

Local DB target, only when explicitly needed for local checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Target deployment DB verification must be environment-explicit. The operator/agent must confirm the exact staging/production `DATABASE_URL` before running migrations, schema checks, or smoke data setup.

## Hard Stops

Stop execution for human input if any of these occur:

- Production/staging `DATABASE_URL` is missing or ambiguous.
- A command might run against the wrong database.
- Migration drift looks destructive or uncertain.
- Clerk production/test-user setup is unavailable or ambiguous.
- Admin provisioning path is ambiguous.
- Quote privacy smoke fails.
- Messaging privacy smoke fails.
- Smoke data cannot be cleaned up safely.
- The work requires out-of-scope product expansion.
- The work requires payments, tracking, public SEO, email delivery, moderation workflow, realtime, queues, Redis, Prisma, Express, AWS/ECS/Terraform, or package-manager migration.
