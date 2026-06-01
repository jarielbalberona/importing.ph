# Phase 5: Rollback, Monitoring, And Launch-Readiness Handoff

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Goal

Produce the final operational handoff: rollback/debug checklist, monitoring expectations, launch status category, and remaining deferred work.

## Scope

- Define deployment rollback/debug checklist.
- Define minimum logs/monitoring to inspect.
- Define go/no-go checklist.
- Assign final launch status category.
- Write initiative final report if all phases are complete.

## Out Of Scope

- Adding analytics dashboards.
- Adding observability vendors.
- Adding queues/workers.
- Adding public SEO or growth features.
- Expanding marketplace scope.

## Inputs

- Phase 1 through Phase 4 reports.
- Deployment smoke evidence.
- Current `.ai/core/*` and `.ai/state/*`.
- Render deployment evidence if available.

## Tasks

- Document rollback options for failed deploy, failed migration, auth failure, and privacy smoke failure.
- Document logs to inspect for Next.js runtime, Render deploy/build logs, Clerk auth issues, and database errors.
- Define minimum operational monitoring: deploy health, error logs, DB connection/migration status, Clerk auth health, smoke-test status.
- Define launch category:
  - `local validation only`
  - `staging smoke passed`
  - `controlled beta ready`
  - `public launch ready`
- Document remaining deferred work and risks.
- Write final report.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`
- `node tools/ai-runner/index.mjs production-readiness-admin-runbook --check-only`
- `git diff --check -- .ai/initiatives/production-readiness-admin-runbook .ai/state`

## Expected Evidence

- Final report states current launch category.
- Final report states whether controlled beta is safe.
- Remaining deferred work is explicit.
- No public launch claim is made unless deployed smoke and cleanup are actually proven.

## Repair Policy

Allowed repairs:

- Fix markdown/runbook consistency.
- Fix state/report formatting.

Hard-stop if any launch category would require unproven production behavior, unresolved quote privacy, unresolved messaging privacy, missing admin provisioning, or unsafe cleanup.

## Completion Notes

Phase 5 completed on `2026-06-01`.

Launch category:

- Current status: `local validation only`.
- Next status available after operator action: `ready for Render/staging smoke`.
- Not `controlled beta ready` until target migration, admin provisioning, deployed smoke, quote privacy proof, messaging privacy proof, notification scoping proof, admin suspension proof, and exact cleanup pass on the target environment.
- Not `public launch ready`.

Rollback/debug checklist:

- Failed deploy: inspect Render build logs, confirm Node `22`, run local `npm run build`, roll back to previous known-good deploy if available.
- Failed runtime auth: verify Clerk publishable/secret keys, sign-in/sign-up URLs, fallback redirects, and Clerk dashboard domain settings.
- Failed DB connection: verify `DATABASE_URL` source, database availability, SSL/connection policy, and migration status.
- Failed migration: stop, inspect migration output, confirm backup/snapshot posture, and do not run `db:push`.
- Failed quote privacy/messaging smoke: stop launch; inspect server-side DTO/query/action guards before any user invite.

Minimum monitoring expectations:

- Render deploy/build status.
- Render runtime logs for auth, DB, and server-action errors.
- Database migration command output and schema-check output.
- Clerk auth/sign-in failures.
- Manual smoke status log for each deployed smoke account and cleanup result.

Handoff:

- Runbook is complete enough to proceed to target environment confirmation and Render/staging smoke.
- Controlled beta is not safe to claim yet.
