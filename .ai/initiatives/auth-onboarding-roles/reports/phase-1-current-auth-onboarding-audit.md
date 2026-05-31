# Phase 1 Report: Current Auth Onboarding Audit

Final status: `passed`

## Summary

Phase 1 audited the current auth, onboarding, role routing, and database-backed authorization implementation. No application code, schema, Clerk configuration, or marketplace feature files were changed.

The dependency `local-db-migration-proof` is complete with a final report and a human-accepted `PASS WITH ISSUES` verdict.

## Files Inspected

- `.ai/initiatives/local-db-migration-proof/reports/final-report.md`
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
- `app/app/requests/page.tsx`
- `app/app/forwarder/requests/page.tsx`
- `app/admin/page.tsx`
- `app/unauthorized/page.tsx`
- `scripts/prove-onboarding.ts`

## Files Changed

- `.ai/initiatives/auth-onboarding-roles/phases/phase-1-current-auth-onboarding-audit.md`
- `.ai/initiatives/auth-onboarding-roles/reports/phase-1-current-auth-onboarding-audit.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision file update was made.

## Current Implementation Truth

Clerk setup:

- `app/layout.tsx` wraps the application with `ClerkProvider`.
- Sign-in is implemented at `app/sign-in/[[...sign-in]]/page.tsx`.
- Sign-up is implemented at `app/sign-up/[[...sign-up]]/page.tsx`.
- Sign-in and sign-up both force/fallback redirect to `/after-auth`.

Middleware:

- `proxy.ts` uses Clerk middleware.
- Protected route matcher covers `/after-auth(.*)`, `/onboarding(.*)`, `/app(.*)`, and `/admin(.*)`.

First-login flow:

- `app/after-auth/page.tsx` calls `getProfileForCurrentUser()`.
- If no PostgreSQL profile exists, `/after-auth` redirects to `/onboarding`.
- If a profile exists, `/after-auth` redirects through `destinationForRole(profile.role)`.

Onboarding:

- `app/onboarding/page.tsx` redirects already-profiled users to their role destination.
- The onboarding form supports only `importer` and `forwarder`.
- `app/onboarding/actions.ts` uses Clerk `auth()`, sends unauthenticated submissions to Clerk sign-in, parses form data with `onboardingSchema`, calls `createOnboardingProfile()`, and redirects by database role.

Database writes:

- `lib/onboarding.ts` validates `role`, `fullName`, and `companyName`.
- New importer onboarding inserts `user_profiles` and `importer_profiles` inside a transaction.
- New forwarder onboarding inserts `user_profiles`, `forwarder_companies`, and `forwarder_members` inside a transaction.
- Existing `user_profiles` rows short-circuit and return `{ created: false }`, avoiding duplicate business row creation in that code path.

Role routing:

- `lib/routes.ts` maps `importer` to `/app/requests`.
- `lib/routes.ts` maps `forwarder` to `/app/forwarder/requests`.
- `lib/routes.ts` maps `admin` to `/admin`.

Authorization:

- `lib/authz.ts` reads Clerk identity, then PostgreSQL `user_profiles`.
- `requireProfile()` redirects profile-less users to `/onboarding`.
- `requireRole()` checks PostgreSQL-backed role state.
- Wrong-role users are redirected to their own role destination, not `/unauthorized`.

Proof routes:

- `app/app/requests/page.tsx` requires `importer`.
- `app/app/forwarder/requests/page.tsx` requires `forwarder`.
- `app/admin/page.tsx` requires `admin`.
- `app/unauthorized/page.tsx` exists but is not currently used by `requireRole()`.

Admin truth:

- `admin` exists in the database enum and route map.
- `/admin` is guarded by `requireRole(["admin"])`.
- Admin cannot be selected during onboarding.
- Admin provisioning is not implemented and must not be invented in this initiative.

## Gaps For Later Phases

- active: `scripts/prove-onboarding.ts` proves importer and forwarder create/read/cleanup paths, but does not yet prove duplicate/retry idempotency behavior.
- active: Browser smoke still needs real Clerk test accounts or an available local Clerk environment in Phase 5.
- accepted: Wrong-role behavior currently redirects users to their own role destination instead of rendering `/unauthorized`; this is current repo truth and should not be changed without product/UX approval.
- accepted: Admin provisioning is intentionally absent.
- accepted: Forwarder trust/approval status is not modeled.

## Commands Run

```bash
node tools/ai-runner/index.mjs auth-onboarding-roles --check-only
```

Result: pass. Output included `Preflight passed for auth-onboarding-roles.`

```bash
git status --short && test -f proxy.ts && test -f app/after-auth/page.tsx && test -f app/onboarding/page.tsx && test -f app/onboarding/actions.ts && test -f lib/authz.ts && test -f lib/onboarding.ts && test -f lib/routes.ts && test -f db/schema.ts && test -f scripts/prove-onboarding.ts
```

Result: pass. Required files exist. Dirty worktree contains prior initiative/memory documentation work and was preserved.

## Verification Summary

- Passed: 2 command groups.
- Failed: 0.
- Skipped: browser smoke and DB proof commands; those are later-phase scope.

## Self-Heal Attempts

None.

## Database / Migration Changes

None.

## Auth / Privacy / Security Impact

No behavior changed. The audit confirms current authorization uses Clerk for identity and PostgreSQL for business role/profile state.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Next Phase Readiness

Next phase:

- `phase-2-importer-onboarding-hardening`

It is safe to continue. Phase 2 should prove importer onboarding and idempotency, adding only narrow proof-script coverage if needed.
