# Cross-Module Data Flow

## Admin Access Flow

```text
/admin/*
-> requireRole(["admin"])
-> admin-only query helper
-> render users / requests / quotes / reports
```

Critical boundaries:

- Admin routes must be server-side guarded.
- Direct admin actions must repeat the admin guard.
- Do not depend on hidden buttons for safety.

## Admin User Profile View Flow

```text
admin users route
-> requireRole(["admin"])
-> query user_profiles
-> join importer_profiles / forwarder_members / forwarder_companies if needed
-> render compact profile list/detail
```

Allowed:

- User identity/profile role.
- Associated importer or forwarder company.
- Suspension state if implemented.

Forbidden:

- Changing Clerk identity data.
- Storing business truth in Clerk metadata.

## Admin Marketplace Inspection Flow

```text
admin requests/quotes route
-> requireRole(["admin"])
-> query shipment requests
-> query related quotes
-> render admin-only inspection view
```

Admin quote visibility is a privileged inspection surface. It must not change importer or forwarder marketplace DTOs.

## Forwarder Suspension Flow

```text
admin suspend forwarder action
-> requireRole(["admin"])
-> validate forwarder company target
-> write suspension state and reason
-> record suspended_by / suspended_at
-> redirect/revalidate admin view
```

Recommended V1:

- Suspend forwarder company first.
- Optionally suspend user profile if Phase 3 proves it is needed and simple.

## Quote Submission Block Flow

```text
forwarder quote submit action
-> requireRole(["forwarder"])
-> forwarder membership lookup
-> request eligibility check
-> suspension check
-> reject if suspended
-> normal quote insertion if active
```

Hard requirement:

- Suspension check must be in the server action or server-side helper that writes quotes.

## Report Flow

```text
user reports subject
-> requireProfile()
-> verify user can see/report subject
-> create report
-> admin report list/detail
```

Report subjects should be typed. Avoid a generic JSON blob that becomes impossible to authorize.

Message reports require the messaging initiative to be complete.

## Suspended User Sign-In Flow

```text
signed-in suspended user
-> Clerk sign-in succeeds
-> PostgreSQL profile says suspended
-> marketplace mutation/action blocks
-> optional blocked-state page
```

Do not disable Clerk accounts from application code in V1 unless explicitly approved.
