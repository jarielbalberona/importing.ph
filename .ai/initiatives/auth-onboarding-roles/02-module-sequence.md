# Module Sequence

## Phase 1: Current Auth Onboarding Audit

Inspect and document current truth from:

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

Output:

- Phase report with implementation truth and gaps.
- No application code changes unless a later phase authorizes them.

## Phase 2: Importer Onboarding Hardening

Prove or minimally harden importer onboarding.

Expected sequence:

1. Confirm `onboardingSchema` validates importer submissions.
2. Confirm `completeOnboarding` requires Clerk auth.
3. Confirm `createOnboardingProfile` creates `user_profiles` and `importer_profiles` transactionally.
4. Confirm retry submissions are safe and do not create duplicate importer rows.
5. Confirm importer redirects to `/app/requests`.
6. Add only narrow proof-script or server-action hardening if the current behavior cannot be verified.

## Phase 3: Forwarder Onboarding Hardening

Prove or minimally harden forwarder onboarding.

Expected sequence:

1. Confirm `onboardingSchema` validates forwarder submissions.
2. Confirm `createOnboardingProfile` creates `user_profiles`, `forwarder_companies`, and `forwarder_members` transactionally.
3. Confirm `forwarder_members.member_role` default/created value is `owner`.
4. Confirm retry submissions are safe and do not create duplicate forwarder companies or memberships.
5. Confirm forwarder redirects to `/app/forwarder/requests`.
6. Document that forwarder trust/approval status is not currently modeled; do not invent it without a product decision.

## Phase 4: Role Guards And Redirects

Prove or minimally harden route guard behavior.

Expected sequence:

1. Confirm Clerk middleware protects `/after-auth`, `/onboarding`, `/app`, and `/admin`.
2. Confirm `requireProfile` sends profile-less users to `/onboarding`.
3. Confirm `requireRole(["importer"])` protects `/app/requests`.
4. Confirm `requireRole(["forwarder"])` protects `/app/forwarder/requests`.
5. Confirm `requireRole(["admin"])` protects `/admin`.
6. Confirm wrong-role behavior and decide whether current role-destination redirect is acceptable.
7. Document admin provisioning as not implemented.

## Phase 5: Verification And Browser Smoke

Run final automated verification and browser smoke where environment permits.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run db:prove-onboarding`
4. `npm run type-check`
5. `npm run lint`
6. `npm run build`

Browser smoke:

1. Sign-up routes to `/after-auth`.
2. New signed-in user without profile routes to `/onboarding`.
3. Importer onboarding routes to `/app/requests`.
4. Forwarder onboarding routes to `/app/forwarder/requests`.
5. Importer cannot access forwarder route.
6. Forwarder cannot access importer route.
7. Admin route behavior is documented from current truth.
