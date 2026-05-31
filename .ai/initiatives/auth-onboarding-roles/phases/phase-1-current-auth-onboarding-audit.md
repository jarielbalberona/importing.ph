# Phase 1: Current Auth Onboarding Audit

Status: pending

## Goal

Document current auth, onboarding, role guard, and database profile truth before changing behavior.

## Scope

- Inspect Clerk routes.
- Inspect middleware/proxy protection.
- Inspect onboarding page and server action.
- Inspect auth helpers and role route constants.
- Inspect profile schema and proof scripts.
- Inspect existing role-gated proof routes.

Allowed file changes during execution:

- `.ai/initiatives/auth-onboarding-roles/phases/phase-1-current-auth-onboarding-audit.md`
- `.ai/initiatives/auth-onboarding-roles/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Clerk configuration changes.
- Browser smoke execution.
- Shipment, quote, or messaging work.

## Inputs

- `local-db-migration-proof` final report or explicit human acceptance.
- `proxy.ts`
- `app/layout.tsx`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/after-auth/page.tsx`
- `app/onboarding/page.tsx`
- `app/onboarding/actions.ts`
- `lib/authz.ts`
- `lib/onboarding.ts`
- `lib/routes.ts`
- `db/schema.ts`
- role-gated proof routes
- `scripts/prove-onboarding.ts`

## Tasks

- Confirm dependency is complete or explicitly accepted.
- Record current Clerk route and redirect setup.
- Record current onboarding form/action behavior.
- Record current DB schema and transaction behavior.
- Record current idempotency behavior.
- Record current role guard and wrong-role behavior.
- Record current admin route truth.
- Identify gaps for later phases.

## Verification Commands

- `git status --short`
- `test -f proxy.ts`
- `test -f app/after-auth/page.tsx`
- `test -f app/onboarding/page.tsx`
- `test -f app/onboarding/actions.ts`
- `test -f lib/authz.ts`
- `test -f lib/onboarding.ts`
- `test -f lib/routes.ts`
- `test -f db/schema.ts`
- `test -f scripts/prove-onboarding.ts`

## Expected Evidence

- Phase report lists current auth/onboarding surfaces and gaps.
- Dependency state is recorded.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependency is incomplete and not explicitly accepted.
- Current repo truth contradicts the initiative objective.
- Execution would require application code changes in the audit phase.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
