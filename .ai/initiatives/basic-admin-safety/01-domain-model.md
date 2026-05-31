# Domain Model

## Terms Observed In Current Repo

### Admin

Implemented as `user_profiles.role = admin`.

Current route:

- `/admin`

Current behavior:

- `app/admin/page.tsx` calls `requireRole(["admin"])`.
- The page is a proof route only.

### User Profile

Implemented as `user_profiles`.

Relevant fields today:

- `id`
- `clerk_user_id`
- `role`
- `full_name`
- timestamps

No suspension fields exist today.

### Forwarder Company

Implemented as `forwarder_companies`.

No trust, approval, or suspension field exists today.

### Forwarder Member

Implemented as `forwarder_members`.

Links user profile to forwarder company. Current implementation has a unique user-profile membership constraint.

## Terms Expected From Dependencies

### Shipment Request

Expected from `shipment-request-wizard`.

Required for this initiative:

- Durable request table.
- Importer ownership.
- Admin-readable list/detail shape.
- Request status truth.

### Quote

Expected from `quote-submission-privacy`.

Required for this initiative:

- Durable quote table.
- Forwarder company ownership.
- Request relationship.
- Quote submission action where suspension can be enforced.
- Privacy boundary that remains intact outside admin routes.

### Message

Expected only if report scope includes messages.

Dependency:

- `quote-gated-messaging`.

Do not include message reports unless message tables/actions are complete or explicitly accepted.

## New Terms For This Initiative

### Suspension

Administrative safety state that blocks marketplace actions.

Recommended V1 targets:

- forwarder company suspension
- optional user profile suspension

Recommended fields:

- `suspended_at`
- `suspended_by_user_profile_id`
- `suspension_reason`

### Suspended Forwarder

A forwarder company, or member user if user suspension exists, that cannot submit quotes.

Required behavior:

- Quote submission must check suspension server-side.
- UI hiding is not enough.
- Existing submitted quotes should remain visible according to quote privacy rules unless product decides otherwise.

### Suspended User

A user profile blocked from marketplace actions.

Recommended behavior:

- User can still sign in.
- User cannot create requests, submit quotes, create messages, or perform other marketplace mutations.
- User sees a clear blocked state if this is implemented.

Do not disable Clerk accounts from app code in V1.

### Report

Optional minimal safety record submitted by a user about marketplace content or another user.

Potential report subjects:

- user
- forwarder company
- shipment request
- quote
- message, only if messaging exists

Recommended report fields:

- reporter user profile id
- subject type
- typed nullable subject references
- reason
- details
- status
- timestamps

### Admin Action Audit

Minimal record of safety action if needed.

Recommended starting point:

- store who suspended, when, and why directly on the suspended entity

Only add a general audit log if product review requires it.

## Privacy Rules

- Admin visibility must be admin-only by route and action guard.
- Admin visibility does not change importer/forwarder visibility.
- Forwarders must still not see competitor quote details.
- Reports must not expose private quote/message details to unauthorized users.
- Direct admin action calls must repeat admin checks.

## Out-Of-Scope Terms

- CRM account.
- Support ticket workflow.
- Document verification.
- Manual forwarder approval pipeline.
- Payment dispute.
- Analytics event.
- Full moderation queue.
- Public report page.
