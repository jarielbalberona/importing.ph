# Phase 4 Report: Role Guards And Redirects

Final status: `passed`

## Summary

Phase 4 verified the current route guard and redirect matrix for auth/onboarding role truth. No application code changes were needed.

The app uses Clerk for route protection and PostgreSQL-backed `user_profiles.role` for application authorization.

## Files Inspected

- `proxy.ts`
- `lib/authz.ts`
- `lib/routes.ts`
- `app/after-auth/page.tsx`
- `app/app/requests/page.tsx`
- `app/app/forwarder/requests/page.tsx`
- `app/admin/page.tsx`
- `app/unauthorized/page.tsx`

## Files Changed

- `.ai/initiatives/auth-onboarding-roles/phases/phase-4-role-guards-and-redirects.md`
- `.ai/initiatives/auth-onboarding-roles/reports/phase-4-role-guards-and-redirects.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision file update was made.

## Route Protection Matrix

Middleware:

- `proxy.ts` protects `/after-auth(.*)`, `/onboarding(.*)`, `/app(.*)`, and `/admin(.*)` with Clerk `auth.protect()`.

Profile routing:

- `/after-auth` uses `getProfileForCurrentUser()`.
- No PostgreSQL profile redirects to `/onboarding`.
- Existing profile redirects through `destinationForRole(profile.role)`.

Role destinations:

- `importer` -> `/app/requests`
- `forwarder` -> `/app/forwarder/requests`
- `admin` -> `/admin`

Page-level role guards:

- `/app/requests` calls `requireRole(["importer"])`.
- `/app/forwarder/requests` calls `requireRole(["forwarder"])`.
- `/admin` calls `requireRole(["admin"])`.

Wrong-role behavior:

- `requireRole()` redirects wrong-role users to `destinationForRole(profile.role)`.
- `/unauthorized` exists but is not currently used by `requireRole()`.
- This redirect behavior remains accepted for now; changing it would be a product/UX decision.

Admin route:

- `admin` exists as a database enum and route destination.
- `/admin` is guarded by database-backed `requireRole(["admin"])`.
- Onboarding does not provision admins.
- No admin provisioning was added.

## Commands Run

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
```

Initial result: both passed. These two were run concurrently by operator error, so they were rerun sequentially.

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
```

Sequential result: pass.

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
```

Sequential result: pass.

## Smoke Tests

Browser smoke was not part of Phase 4. It is Phase 5 scope.

Static route guard smoke:

- Importer route guard present: pass.
- Forwarder route guard present: pass.
- Admin route guard present: pass.
- Wrong-role redirect behavior documented: pass.

## Self-Heal Attempts

None.

## Database / Migration Changes

None.

## Auth / Privacy / Security Impact

No behavior changed. Verification confirms role authorization is database-backed and does not use Clerk metadata for business role truth.

## Verification Summary

- Passed: all required Phase 4 verification.
- Failed: 0.
- Skipped: browser smoke; Phase 5 scope.

## Risks And Limitations

- accepted: Wrong-role access redirects to the user's own role destination rather than rendering `/unauthorized`.
- accepted: Admin provisioning is not implemented.
- active: Browser smoke still needs Phase 5 execution with Clerk test environment.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Next Phase

`phase-5-verification-and-browser-smoke`

It is safe to continue. Phase 5 must run final automated verification sequentially and attempt browser smoke only against local/test Clerk and local DB targets.
