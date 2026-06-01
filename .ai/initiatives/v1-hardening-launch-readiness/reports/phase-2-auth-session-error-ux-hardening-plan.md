# Phase 2 Report: Auth Session Error UX Hardening Plan

Final status: `passed`

## Summary

Phase 2 hardened wrong-role access behavior without weakening database-backed role guards. `requireRole()` now redirects users with the wrong PostgreSQL role to `/unauthorized` instead of silently sending them back to their own workspace.

Signed-out redirects, existing importer/forwarder sessions, already-onboarded `/onboarding` behavior, and non-admin admin access were verified in the browser.

## Files Changed

- `lib/authz.ts`
- `.ai/initiatives/v1-hardening-launch-readiness/00-overview.md`
- `.ai/initiatives/v1-hardening-launch-readiness/phases/phase-2-auth-session-error-ux-hardening-plan.md`
- `.ai/initiatives/v1-hardening-launch-readiness/reports/phase-2-auth-session-error-ux-hardening-plan.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md`

## Implementation Summary

- Removed role-destination redirect from wrong-role access in `lib/authz.ts`.
- Wrong-role access now redirects to `/unauthorized`.
- Missing profile behavior remains `/onboarding`.
- Signed-out behavior remains Clerk sign-in redirect.
- Existing-profile `/after-auth` and `/onboarding` behavior still routes users to their database role destination.

## Auth Session Flow Table

| Scenario | Result |
| --- | --- |
| Signed-out protected route | Clerk sign-in redirect |
| Signed-in without profile | `/onboarding` |
| Signed-in importer `/after-auth` | `/app/requests` |
| Signed-in forwarder `/after-auth` | `/app/forwarder/requests` |
| Existing profile visits `/onboarding` | role destination |
| Wrong-role route access | `/unauthorized` |

## Wrong-Role Behavior Decision

Decision: wrong-role access should show `/unauthorized`.

Rationale: silent role-home redirects hide authorization failures and make smoke/security verification weaker. `/unauthorized` is explicit, deterministic, and does not weaken server-side guards.

## Commands Run

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`: pass.

## Browser Smoke

Signed-out:

- `/app/requests`: pass; redirected to `/sign-in?...`, no importer data visible.
- `/app/forwarder/requests`: pass; redirected to `/sign-in?...`, no forwarder data visible.
- `/admin`: pass; redirected to `/sign-in?...`, no admin data visible.

Importer account:

- Account: `a1+clerk_test@clerk.com`.
- `/after-auth`: pass; redirected to `/app/requests`.
- `/onboarding`: pass; redirected to `/app/requests`.
- `/app/forwarder/requests`: pass; redirected to `/unauthorized`, no forwarder request data visible.
- `/admin`: pass; redirected to `/unauthorized`, no admin data visible.

Forwarder account:

- Account: `a2+clerk_test@clerk.com`.
- `/after-auth`: pass; redirected to `/app/forwarder/requests`.
- `/onboarding`: pass; redirected to `/app/forwarder/requests`.
- `/app/requests`: pass; redirected to `/unauthorized`, no importer request list visible.
- `/admin`: pass; redirected to `/unauthorized`, no admin data visible.

Database check:

- Importer account has one `user_profiles` row with `role = importer`, one `importer_profiles` row, and zero forwarder memberships.
- Forwarder account has one `user_profiles` row with `role = forwarder`, one forwarder membership, and zero importer profiles.

## Verification Summary

- Passed commands: 3.
- Failed commands: 0.
- Browser smoke cases passed: 11.

## Self-Heal Attempts

None.

## Database And Migration Changes

None.

No migration was added. No destructive database operation was run.

## Auth, Privacy, And Security Impact

Positive. Wrong-role access is now explicit and deterministic. Server-side guards still depend on PostgreSQL role truth through `requireRole()`.

No quote privacy, messaging privacy, or admin safety boundary was weakened.

## Accepted Issues

- Existing disposable Clerk smoke rows remain in the local development database.
- `/unauthorized` is simple but adequate for V1.

## Risks And Gaps

- active: Admin provisioning remains unresolved for Phase 3.
- active: Reports/user-level suspension decisions remain unresolved for Phase 3.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md`

## Report File Written

- `.ai/initiatives/v1-hardening-launch-readiness/reports/phase-2-auth-session-error-ux-hardening-plan.md`

## Next Phase

Next phase: `phase-3-admin-and-safety-hardening-plan`.

Autonomous execution can continue.
