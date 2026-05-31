# Basic Admin Safety

## Initiative Key

`basic-admin-safety`

## Dependencies

depends_on: auth-onboarding-roles, shipment-request-wizard, quote-submission-privacy

Dependency rule: do not begin execution until the core role model, request creation, and quote submission/privacy are complete, have final reports, and are not blocked or failed. Messaging/reporting portions may add `quote-gated-messaging` as a dependency if message reports are included during review.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: no
- Latest execution status: not started.

Lifecycle rule: this initiative is authored for review. Lock it only after dependencies and report/message scope are reviewed.

## Objective

Provide just enough admin control for V1 to inspect marketplace activity and suspend unsafe users or forwarders without turning Importing.ph into a full operations back office.

This is safety infrastructure for the marketplace loop. It is not CRM, ERP, compliance workflow, or a moderation platform.

## Repo Baseline Observed During Authoring

- Current admin route is `app/admin/page.tsx`.
- `app/admin/page.tsx` is a proof route guarded by `requireRole(["admin"])`.
- `user_role` includes `admin`.
- Onboarding supports only `importer` and `forwarder`; admin is not selectable.
- `lib/routes.ts` maps `admin` to `/admin`.
- Current schema has `user_profiles`, `importer_profiles`, `forwarder_companies`, and `forwarder_members`.
- Current schema has no shipment request, quote, message, report, suspension, trust, or audit-action tables.
- Current app code has no forwarder suspension field.
- Current app code has no user suspension field.
- Current app code has no report placeholders.

## Scope

- Admin-only access boundary.
- Admin can view users/profiles.
- Admin can view shipment requests.
- Admin can view quotes.
- Admin can view reports if reports exist or are included in this initiative.
- Admin can suspend forwarders/users according to current domain rules.
- Suspended forwarder cannot submit quotes.
- Define whether suspended users can sign in but are blocked from marketplace actions.
- Define basic reports model if not already present:
  - report user
  - report quote
  - report request/message if easy and safe
- Define auditability expectations for admin actions if current memory requires it.
- Define route/action authorization and direct-action abuse prevention.

## Non-Goals

- Do not build a full CRM, support dashboard, ERP, or moderation platform.
- Do not build document verification/manual approval unless current memory requires it.
- Do not build payments, escrow, tracking, reviews, analytics, subscriptions, or public SEO pages.
- Do not build advanced report workflows.
- Do not introduce queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current admin/safety baseline is audited and recorded.
- Admin-only routes/actions use server-side `requireRole(["admin"])` or an equivalent database-backed guard.
- Admin can view user/profile records.
- Admin can view shipment requests after request schema exists.
- Admin can view quotes after quote schema exists while preserving competitor privacy outside admin routes.
- Suspension model is explicit for users and/or forwarder companies.
- Suspended forwarder cannot submit quotes.
- Normal forwarder can still submit quotes.
- Non-admin users cannot access admin routes or perform admin actions.
- Report model is implemented only if scope remains minimal and dependencies support it.
- Any admin action auditability requirement is documented and implemented only if required by current memory/product review.

## Recommended Product Decisions For Review

- V1 should implement forwarder-company suspension first, because quote submission is company-scoped and this directly protects the marketplace.
- User suspension should block marketplace actions while still allowing sign-in to show a clear blocked state. Do not try to disable Clerk accounts from app code in V1.
- If both user and company suspension exist, either one should block forwarder quote submission.
- Admin read-only visibility can include quotes, but must remain behind admin-only routes and never relax importer/forwarder privacy boundaries.
- Basic reports are optional. If included, implement one small `reports` table with typed subject references and simple status, not a workflow engine.
- Auditability can start as `suspended_by`, `suspended_at`, and reason fields. A general admin action log is only justified if review requires it.

## Domain Model

- Admin: user profile with role `admin`.
- Suspension: state blocking marketplace actions for a user or forwarder company.
- Suspended forwarder: forwarder company or member user that cannot submit quotes.
- Report: optional user-submitted safety report about a user, quote, request, or message.
- Admin action audit: minimal record of who took safety action and why.

## Module Sequence

1. Audit current admin, authz, schema, suspension, and report truth.
2. Define admin access and read-only views.
3. Define and implement suspension/safety actions.
4. Define and implement minimal reports only if needed.
5. Run automated verification and manual smoke.

## Cross-Module Data Flow

```text
/admin
-> requireRole(["admin"])
-> admin-only query helpers
-> users / requests / quotes / reports views
```

```text
admin suspend forwarder
-> requireRole(["admin"])
-> validate target forwarder company or user
-> write suspension state and audit fields
-> quote submission checks suspension before insert
```

```text
quote submission
-> requireRole(["forwarder"])
-> forwarder membership lookup
-> suspension check
-> blocked if suspended
-> normal quote flow if active
```

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Manual smoke:

- Non-admin cannot access admin routes.
- Admin can view users.
- Admin can view requests.
- Admin can view quotes.
- Admin can suspend forwarder.
- Suspended forwarder cannot submit quote.
- Normal forwarder can still submit quote.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Product requires document verification/manual approval.
- Product requires disabling Clerk accounts rather than app-level marketplace blocking.
- Admin quote visibility would weaken importer/forwarder privacy outside admin routes.
- Suspension semantics are unclear for signed-in suspended users.
- Report scope expands into a full moderation workflow.
- Any change requires payments, escrow, tracking, reviews, analytics, subscriptions, public SEO, queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.
