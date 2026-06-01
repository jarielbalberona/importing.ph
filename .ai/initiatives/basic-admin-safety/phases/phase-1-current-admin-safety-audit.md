# Phase 1: Current Admin Safety Audit

Status: passed

## Goal

Document current admin route, authz, schema, suspension, trust, report, request, and quote baseline before implementing admin safety controls.

## Scope

- Inspect current admin route.
- Inspect current authz helpers and route constants.
- Inspect current schema and migrations.
- Inspect completed request and quote dependency artifacts.
- Search for suspension, trust, report, moderation, and safety placeholders.
- Record current gaps and hard blockers.

Allowed file changes during execution:

- `.ai/initiatives/basic-admin-safety/phases/phase-1-current-admin-safety-audit.md`
- `.ai/initiatives/basic-admin-safety/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Admin view implementation.
- Suspension implementation.
- Reports implementation.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `app/admin/page.tsx`
- `lib/authz.ts`
- `lib/routes.ts`
- `db/schema.ts`
- `drizzle/`
- request and quote routes/actions from dependencies.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record current admin access behavior.
- Record current user/profile schema.
- Record current request/quote schema truth.
- Record current suspension/trust fields if any.
- Record current report placeholders if any.
- Record whether message reports require `quote-gated-messaging`.

## Verification Commands

- `git status --short`
- `test -f app/admin/page.tsx`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `test -f db/schema.ts`
- `test -d drizzle`
- `rg -n "admin|suspend|suspended|trust|report|moderation|safety" app db lib components scripts`
- `rg -n "quote|message|conversation|shipment|request" app db lib components scripts`

## Expected Evidence

- Phase report documents current admin/safety baseline.
- Phase report identifies missing suspension/report/request/quote surfaces.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Request or quote schemas are absent.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Dependency final reports are present and accepted for auth, requests, quotes, and quote privacy.
- Current `/admin` route is a proof page guarded by `requireRole(["admin"])`.
- `user_role` includes `admin`, but onboarding does not provision admins.
- Request, quote, conversation, message, and notification schemas now exist.
- No suspension, trust status, safety report, moderation, or admin audit-log model exists yet.
- No report placeholders exist.
