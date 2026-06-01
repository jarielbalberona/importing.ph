# Phase 1: Deployment And Environment Audit

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Goal

Document exact current deployment, environment, database, Clerk, and route assumptions from repo evidence.

## Scope

- Read deployment/config files.
- Read relevant app/admin/auth/database files.
- Write a phase report and update `.ai/state/*` during execution.
- Do not change application code.

## Out Of Scope

- Running migrations.
- Running deployed smoke.
- Creating admin users.
- Editing app code, package scripts, deployment config, schema, or env files.

## Inputs

- `.ai/core/*`
- `.ai/state/*`
- prior final reports
- `render.yaml`
- `package.json`
- `.env.example`
- `.env.local.example`
- `drizzle.config.ts`
- `docker-compose.yml`
- `proxy.ts`
- `db/index.ts`
- `lib/authz.ts`
- `lib/routes.ts`

## Tasks

- Confirm actual Render service/database configuration.
- Confirm package manager and scripts.
- Confirm env var names required for app startup.
- Confirm Drizzle env loading behavior.
- Confirm local DB URL and Docker Compose port.
- Confirm protected route middleware behavior.
- Identify missing production/staging configuration and runbook gaps.

## Verification Commands

- `test -f render.yaml && test -f package.json && test -f drizzle.config.ts && test -f .env.example && test -f .env.local.example`
- `rg -n "DATABASE_URL|CLERK|NEXT_PUBLIC_CLERK|buildCommand|startCommand|fromDatabase" render.yaml .env.example .env.local.example drizzle.config.ts package.json`
- `git diff --check -- .ai/initiatives/production-readiness-admin-runbook .ai/state`

## Expected Evidence

- Phase report lists observed deployment truth and gaps.
- No application code changed.
- No migration or DB command run.

## Repair Policy

Allowed repairs:

- Fix initiative/state markdown formatting only.

Hard-stop instead of repairing when deployment target, production database, Clerk configuration, or Render ownership is ambiguous and cannot be resolved from repo evidence.

## Completion Notes

Phase 1 completed on `2026-06-01`.

Observed from repo:

- `render.yaml` defines one Render web service named `importing-ph`.
- Render build command is `npm ci && npm run build`.
- Render start command is `npm run start`.
- Render Node env is `22`.
- Render database resource is `importing-ph-db`.
- `DATABASE_URL` is wired from the Render database connection string.
- Clerk publishable and secret keys are required but not stored in repo.
- Clerk sign-in/sign-up URLs and fallback redirects are configured.
- Local Docker Compose PostgreSQL uses host port `55432`, not `5432`.
- Drizzle and runtime DB clients load `.env.local` first, then `.env`.
- Protected routes are `/after-auth`, `/onboarding`, `/app/**`, and `/admin/**`.

Accepted issues:

- Actual deployed URL is not confirmed from repo evidence.
- Actual staging/production `DATABASE_URL` is not visible in repo and must be confirmed by an operator before target DB commands.
- Actual Clerk production/test configuration is not visible in repo and must be confirmed before deployed smoke.
