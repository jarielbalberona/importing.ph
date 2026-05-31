# Domain Model

## Implemented Terms

### Clerk User

Authenticated identity from Clerk.

Current repo usage:

- `auth()` from `@clerk/nextjs/server` returns `userId`.
- Sign-in and sign-up routes are Clerk components.
- Clerk middleware protects selected route groups in `proxy.ts`.

Boundary:

- Clerk is authentication only.
- Clerk metadata must not become the business source of truth.

### User Profile

Implemented as PostgreSQL table `user_profiles`.

Current fields:

- `id`
- `clerk_user_id`
- `role`
- `full_name`
- timestamps

Current constraints:

- Unique index on `clerk_user_id`.

Role truth lives here.

### User Role

Implemented as PostgreSQL enum `user_role`.

Current values:

- `importer`
- `forwarder`
- `admin`

Current route destinations:

- `importer` -> `/app/requests`
- `forwarder` -> `/app/forwarder/requests`
- `admin` -> `/admin`

### Importer Profile

Implemented as PostgreSQL table `importer_profiles`.

Current fields:

- `id`
- `user_profile_id`
- `company_name`
- timestamps

Current constraint:

- One importer profile per user profile.

### Forwarder Company

Implemented as PostgreSQL table `forwarder_companies`.

Current fields:

- `id`
- `name`
- timestamps

Current behavior:

- Forwarder onboarding creates a company using the submitted company name.

### Forwarder Member

Implemented as PostgreSQL table `forwarder_members`.

Current fields:

- `id`
- `user_profile_id`
- `forwarder_company_id`
- `member_role`
- timestamps

Current behavior:

- Forwarder onboarding creates one membership with `memberRole: "owner"`.

## Auth Flow Terms

### First-Login User

A Clerk-authenticated user with no matching `user_profiles` row.

Expected behavior:

- `/after-auth` redirects to `/onboarding`.
- `requireProfile()` redirects to `/onboarding`.

### Onboarded User

A Clerk-authenticated user with a matching `user_profiles` row.

Expected behavior:

- `/onboarding` redirects away to the role destination.
- `/after-auth` redirects to the role destination.

### Duplicate / Retry Onboarding Submission

A repeated onboarding submission for a Clerk user that already has a `user_profiles` row.

Current repo behavior:

- `createOnboardingProfile` returns the existing profile with `created: false`.
- It does not create a second importer profile, forwarder company, or forwarder member.

Required proof:

- Retry submission is safe.
- Retry does not switch roles silently.
- Retry does not create duplicate business records.

### Wrong-Role Access

A signed-in importer hitting a forwarder-only route, or a signed-in forwarder hitting an importer-only route.

Current repo behavior:

- `requireRole` redirects the user to `destinationForRole(profile.role)`.
- It does not currently render `/unauthorized`.

This initiative must document whether to keep this redirect behavior or intentionally change it. Do not change it without a product/UX decision.

### Admin Route

Admin exists as a database enum role and route destination.

Current repo truth:

- `/admin` requires `admin`.
- Admin cannot be selected in onboarding.
- Admin provisioning mechanism is not implemented.

Do not invent admin provisioning in this initiative.

## Out-Of-Scope Terms

- Shipment request.
- Quote.
- Message.
- Conversation.
- Tenant.
- Workspace.
- Verification workflow.
- Manual approval workflow.

## Source-Of-Truth Rules

- Clerk owns authentication state.
- PostgreSQL owns business role/profile state.
- `user_profiles.role` drives application authorization.
- Importer and forwarder business rows must be created transactionally with `user_profiles`.
- Future route/action guards must read database-backed role state, not Clerk metadata.
