# Auth Onboarding Roles

## Initiative Key

`auth-onboarding-roles`

## Dependencies

depends_on: local-db-migration-proof

Dependency rule: do not begin execution until `local-db-migration-proof` is completed with a final report or a human explicitly accepts the local DB/migration proof as already proven. Running auth/onboarding work without a proven local database is sloppy and will produce fake confidence.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Latest execution status: completed. Final verdict: `PASS WITH ISSUES`.

Lifecycle rule: this initiative executed after `local-db-migration-proof` was completed and accepted.

## Objective

Prove and harden the Importing.ph authentication, onboarding, and database-backed role truth path.

A signed-in Clerk user must be able to complete importer or forwarder onboarding, create the correct PostgreSQL business records, and be routed and guarded by database-backed role state.

## Repo Baseline Observed During Authoring

- Clerk wraps the app in `app/layout.tsx` with `ClerkProvider`.
- Clerk sign-in route exists at `app/sign-in/[[...sign-in]]/page.tsx`.
- Clerk sign-up route exists at `app/sign-up/[[...sign-up]]/page.tsx`.
- Both sign-in and sign-up force/fallback redirect to `/after-auth`.
- `proxy.ts` protects `/after-auth`, `/onboarding`, `/app`, and `/admin` routes with Clerk middleware.
- `/after-auth` reads the current PostgreSQL profile and redirects profile-less users to `/onboarding`.
- `/onboarding` blocks already-onboarded users by redirecting to `destinationForRole(profile.role)`.
- Onboarding form supports `importer` and `forwarder`; admin is not selectable.
- `app/onboarding/actions.ts` authenticates via Clerk, validates form data, calls `createOnboardingProfile`, and redirects by database role.
- `lib/onboarding.ts` creates importer and forwarder records in a transaction.
- Existing idempotency behavior: if `user_profiles` already has the Clerk user id, `createOnboardingProfile` returns the existing profile and does not create duplicate business rows.
- `lib/authz.ts` uses PostgreSQL-backed profile state for `requireProfile` and `requireRole`.
- `lib/routes.ts` maps `importer` to `/app/requests`, `forwarder` to `/app/forwarder/requests`, and `admin` to `/admin`.
- Importer proof route `app/app/requests/page.tsx` requires `importer`.
- Forwarder proof route `app/app/forwarder/requests/page.tsx` requires `forwarder`.
- Admin proof route `app/admin/page.tsx` requires `admin`.
- `app/unauthorized/page.tsx` exists, but current `requireRole` redirects wrong-role users to their own destination instead of `/unauthorized`.
- `scripts/prove-onboarding.ts` currently proves importer and forwarder DB insert/read paths without real Clerk API calls.

## Scope

- Keep Clerk as authentication only.
- Keep PostgreSQL as business role/profile source of truth.
- Prove first-login signed-in users without a business profile are sent to `/onboarding`.
- Prove importer onboarding creates or verifies:
  - `user_profiles`
  - `importer_profiles`
- Prove forwarder onboarding creates or verifies:
  - `user_profiles`
  - `forwarder_companies`
  - `forwarder_members`
- Define and verify safe duplicate/retry onboarding behavior.
- Prove deterministic redirects after onboarding.
- Prove protected routes use database-backed roles.
- Prove importers cannot access forwarder-only routes/actions.
- Prove forwarders cannot access importer-only routes/actions.
- Document admin route handling according to current repo truth.
- Define browser smoke tests for sign-up, sign-in, onboarding, redirects, and unauthorized/wrong-role access.

## Non-Goals

- Do not build shipment request creation.
- Do not build forwarder request browsing beyond existing proof route behavior.
- Do not build quotes.
- Do not build messaging.
- Do not implement document verification or manual approval.
- Do not store business truth in Clerk metadata.
- Do not introduce multi-tenant SaaS abstractions or `tenantId`.
- Do not change deployment architecture.
- Do not add payments, tracking, analytics, queues, Redis, WebSockets, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current auth/onboarding implementation truth is audited and documented with gaps.
- Importer onboarding is proven or minimally hardened for DB writes, validation, idempotency, and redirects.
- Forwarder onboarding is proven or minimally hardened for DB writes, company/member creation, validation, idempotency, and redirects.
- Role guards and redirects are proven or minimally hardened for importer, forwarder, and admin routes.
- Browser smoke cases are documented and executed during the final phase when credentials/environment allow it.
- Automated verification commands are run and recorded:
  - `npm run db:migrate`
  - `npm run db:check`
  - `npm run db:prove-onboarding`
  - `npm run type-check`
  - `npm run lint`
  - `npm run build`
- No marketplace feature implementation is added.
- No business truth is moved into Clerk metadata.

## Domain Model

- Clerk user: authenticated identity from Clerk.
- User profile: PostgreSQL `user_profiles` row linked by `clerk_user_id`.
- Importer profile: PostgreSQL `importer_profiles` row tied to `user_profiles`.
- Forwarder company: PostgreSQL `forwarder_companies` row created for forwarder onboarding.
- Forwarder member: PostgreSQL `forwarder_members` row linking user profile to forwarder company.
- User role: PostgreSQL enum value `importer`, `forwarder`, or `admin`.
- Role destination: route returned by `destinationForRole`.

## Module Sequence

1. Audit current auth/onboarding/role implementation.
2. Prove or minimally harden importer onboarding.
3. Prove or minimally harden forwarder onboarding.
4. Prove or minimally harden role guards and redirects.
5. Run automated verification and browser smoke tests, then produce the final handoff.

## Cross-Module Data Flow

```text
Clerk sign-in/sign-up
-> /after-auth
-> lib/authz.getProfileForCurrentUser()
-> user_profiles lookup by clerk_user_id
-> /onboarding when no profile exists
-> destinationForRole(profile.role) when profile exists
```

```text
/onboarding form
-> app/onboarding/actions.completeOnboarding()
-> Clerk auth userId
-> onboardingSchema validation
-> lib/onboarding.createOnboardingProfile()
-> user_profiles plus importer/forwarder business rows
-> destinationForRole(result.profile.role)
```

```text
Protected route
-> proxy.ts Clerk protection
-> page-level requireRole()
-> PostgreSQL user_profiles role
-> allow route or redirect to user's own role destination
```

## Verification Plan

Final automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run db:prove-onboarding`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Browser smoke cases:

- Signed-out user visiting `/after-auth` is sent through Clerk sign-in.
- Newly signed-in user without a profile lands on `/onboarding`.
- Importer onboarding redirects to `/app/requests`.
- Forwarder onboarding redirects to `/app/forwarder/requests`.
- Importer visiting `/app/forwarder/requests` cannot access the forwarder page.
- Forwarder visiting `/app/requests` cannot access the importer page.
- Admin route behavior is documented from current truth; admin creation is not part of onboarding.

## Hard Stops

Stop for human input if any of these occur:

- `local-db-migration-proof` is incomplete and no human explicitly accepts it as already proven.
- A required Clerk test account or local Clerk environment is unavailable for browser smoke.
- The auth flow requires storing business truth in Clerk metadata.
- Admin provisioning needs a product/security decision.
- Duplicate onboarding behavior would create conflicting business records.
- Wrong-role route handling requires a UX/product decision between redirecting home and rendering `/unauthorized`.
- Any fix requires shipment, quote, messaging, or tenant abstractions.
- Any verification would target production data.
