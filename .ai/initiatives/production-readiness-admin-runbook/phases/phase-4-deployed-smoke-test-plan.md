# Phase 4: Deployed Smoke Test Plan

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Goal

Define and, when execution is authorized, run non-destructive deployed smoke tests for the implemented V1 marketplace loop.

## Scope

- Define disposable account strategy.
- Define smoke steps for auth, requests, quotes, messaging, notifications, and admin suspension.
- Define exact expected UI and DB state.
- Define cleanup by exact IDs/prefix.

## Out Of Scope

- Public SEO.
- New product features.
- Full load/performance testing.
- Real customer accounts.
- Destructive production cleanup.

## Inputs

- `04-verification-plan.md`
- target deployment URL.
- confirmed target DB.
- Clerk test/production configuration.
- admin provisioning output from Phase 2.

## Tasks

- Prepare disposable Importer A, Forwarder A, Forwarder B, and Admin accounts where needed.
- Smoke signed-out redirects.
- Smoke onboarding/session routing.
- Smoke wrong-role `/unauthorized`.
- Smoke request creation and forwarder browsing.
- Smoke quote privacy matrix.
- Smoke quote comparison and accept/reject.
- Smoke quote-gated messaging.
- Smoke notification records/read state.
- Smoke admin access and forwarder-company suspension.
- Clean up exact smoke data and disposable users.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`
- target DB inspection commands must be written with explicit confirmed target `DATABASE_URL`
- browser smoke steps from `04-verification-plan.md`
- `git diff --check -- .ai/initiatives/production-readiness-admin-runbook .ai/state`

## Expected Evidence

- Browser smoke evidence for every listed route/action.
- DB evidence for created request, quote, conversation, messages, notifications, suspension, and cleanup.
- Explicit pass/fail for quote privacy matrix.
- Explicit pass/fail for messaging privacy.
- Exact cleanup result.

## Repair Policy

Allowed repairs:

- Documentation fixes.
- Safe, local, in-scope test-account/session handling.

Hard-stop for quote privacy failure, messaging privacy failure, admin ambiguity, target DB ambiguity, missing Clerk setup, or inability to clean up smoke data safely.

## Completion Notes

Phase 4 completed on `2026-06-01`.

Smoke plan status:

- Local static checks passed.
- Deployed smoke was not run because no actual staging/production URL, target `DATABASE_URL`, or Clerk target configuration was provided.
- Smoke remains ready to run after operator confirmation of target deployment, target database, Clerk config, and admin provisioning.

Required deployed smoke accounts:

- Disposable Importer A.
- Disposable Forwarder A.
- Disposable Forwarder B.
- Operator-provisioned Admin.

Required deployed smoke proof:

- Signed-out protected routes redirect to Clerk sign-in.
- Importer and forwarder onboarding/session routing works.
- Wrong-role routes land on `/unauthorized`.
- Importer can create posted request.
- Forwarder can browse posted request.
- Quote privacy matrix passes.
- Importer can accept/reject quote.
- Messaging opens only after quote and remains participant-scoped.
- Notification records are recipient-scoped.
- Admin can access `/admin` and suspend forwarder company.
- Suspended forwarder cannot submit quote.
- Exact smoke cleanup succeeds.

Hard stop:

- Do not claim controlled beta readiness until deployed smoke and cleanup actually pass.
