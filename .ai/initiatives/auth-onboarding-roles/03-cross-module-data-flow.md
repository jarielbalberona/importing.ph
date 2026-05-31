# Cross-Module Data Flow

## Clerk Route Flow

```text
/sign-in or /sign-up
-> Clerk SignIn/SignUp component
-> forceRedirectUrl or fallbackRedirectUrl: /after-auth
-> /after-auth
```

Repo evidence:

- Sign-in component is in `app/sign-in/[[...sign-in]]/page.tsx`.
- Sign-up component is in `app/sign-up/[[...sign-up]]/page.tsx`.
- Both redirect to `/after-auth`.

## First-Login Routing Flow

```text
/after-auth
-> getProfileForCurrentUser()
-> Clerk auth userId
-> user_profiles lookup by clerk_user_id
-> no profile
-> redirect /onboarding
```

Critical boundary:

- A Clerk user without a PostgreSQL profile is not fully onboarded.
- Do not infer application role from Clerk metadata.

## Existing-Profile Routing Flow

```text
/after-auth or /onboarding
-> getProfileForCurrentUser()
-> user_profiles role
-> destinationForRole(role)
-> importer: /app/requests
-> forwarder: /app/forwarder/requests
-> admin: /admin
```

Critical boundary:

- Role redirects must be deterministic and centralized through `lib/routes.ts`.

## Importer Onboarding Write Flow

```text
/onboarding form role=importer
-> completeOnboarding(formData)
-> Clerk auth userId
-> onboardingSchema validation
-> createOnboardingProfile(clerkUserId, parsed)
-> transaction
-> insert user_profiles(role=importer)
-> insert importer_profiles(user_profile_id, company_name)
-> redirect /app/requests
```

Retry behavior:

```text
existing user_profiles row
-> return existing profile
-> do not insert duplicate importer_profiles row
-> redirect by existing database role
```

## Forwarder Onboarding Write Flow

```text
/onboarding form role=forwarder
-> completeOnboarding(formData)
-> Clerk auth userId
-> onboardingSchema validation
-> createOnboardingProfile(clerkUserId, parsed)
-> transaction
-> insert user_profiles(role=forwarder)
-> insert forwarder_companies(name)
-> insert forwarder_members(user_profile_id, forwarder_company_id, member_role=owner)
-> redirect /app/forwarder/requests
```

Retry behavior:

```text
existing user_profiles row
-> return existing profile
-> do not insert duplicate forwarder_companies or forwarder_members rows
-> redirect by existing database role
```

## Protected Route Flow

```text
request to /after-auth, /onboarding, /app/*, or /admin/*
-> proxy.ts Clerk middleware auth.protect()
-> page-level requireProfile() or requireRole()
-> PostgreSQL profile lookup
-> allow or redirect
```

Current wrong-role behavior:

```text
requireRole disallows current role
-> redirect(destinationForRole(profile.role))
```

The current code does not use `/unauthorized` for `requireRole` failures.

## Admin Flow

```text
admin user_profiles.role
-> destinationForRole(admin)
-> /admin
-> requireRole(["admin"])
```

Open boundary:

- Admin provisioning is not implemented.
- This initiative must document that truth, not invent an admin creation flow.

## External Services

Clerk is required for interactive browser smoke.

Automated DB proof uses generated Clerk-like ids through `scripts/prove-onboarding.ts` and does not call Clerk APIs.

## Data Safety

- Browser smoke must use test Clerk accounts only.
- DB proof must run against local/non-production database only.
- Generated proof data must be cleaned up.
- Any production `DATABASE_URL` is a hard stop.
