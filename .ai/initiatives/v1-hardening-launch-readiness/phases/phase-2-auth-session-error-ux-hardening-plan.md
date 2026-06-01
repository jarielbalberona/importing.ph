# Phase 2: Auth Session Error UX Hardening Plan

Status: passed

## Goal

Harden auth, session, onboarding, wrong-role, and error UX without weakening database-backed authorization.

## Scope

Potentially affected modules:

- `lib/authz.ts`
- `lib/routes.ts`
- `app/after-auth/page.tsx`
- `app/onboarding/**`
- `app/unauthorized/**`
- protected importer, forwarder, and admin pages/actions only as needed for error handling

## Out Of Scope

- Moving business role truth to Clerk metadata.
- Adding new roles.
- Public SEO.
- Admin provisioning implementation; that belongs to Phase 3.
- Broad UI redesign.

## Inputs

- Phase 1 report.
- `auth-onboarding-roles` final report.
- Current auth/session code.
- Browser smoke expectations in `04-verification-plan.md`.

## Tasks

- Review signed-out redirects.
- Review sign-in/sign-up return paths.
- Review `/after-auth` behavior for missing profile and existing profile.
- Review `/onboarding` access for already-onboarded users.
- Review wrong-role behavior and decide whether `/unauthorized` is better than role-destination redirects.
- Review user-facing errors for server actions that can fail safely.
- Implement only launch-critical UX/auth hardening if the phase audit justifies it.
- Document any accepted behavior that remains unchanged.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`

## Browser Smoke Required

- signed-out protected route redirects.
- importer onboarding/session.
- forwarder onboarding/session.
- importer wrong-role route access.
- forwarder wrong-role route access.
- admin route access with non-admin.

Each smoke case must record account, route, action, expected UI, observed UI, expected DB state where applicable, and pass/fail.

## Expected Evidence

- Auth/session flow table.
- Wrong-role behavior decision.
- Browser smoke result.
- Automated commands pass.
- No role guard weakening.

## Repair Policy

Allowed repairs:

- type-check, lint, or build failures caused by this phase.
- missing imports.
- route/link mismatch inside auth/session scope.
- minor server-action error handling mismatch.

Hard-stop instead of repairing when:

- role authorization semantics are ambiguous.
- a fix would weaken server-side guards.
- a fix requires storing business roles in Clerk metadata as source of truth.
- a product decision is needed for wrong-role UX.

## Completion Notes

Wrong-role access now redirects to `/unauthorized` through the central `requireRole()` guard. Signed-out redirects, existing importer/forwarder session routing, already-onboarded `/onboarding` handling, and non-admin admin access were smoke-tested in the browser.
