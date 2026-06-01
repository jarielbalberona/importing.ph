# Phase 2: Admin Provisioning Runbook

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Goal

Define the smallest safe operator-controlled admin provisioning and removal procedure for staging/production.

## Scope

- Inspect current admin model/routes/actions.
- Define admin seed/provisioning procedure.
- Define rollback/removal procedure.
- Define verification for `/admin`.

## Out Of Scope

- Public admin self-registration.
- Clerk metadata as business role source of truth.
- Full moderation dashboard.
- Report workflow.
- User-level suspension.
- Editing application code unless a later locked execution phase explicitly approves a tiny safety script.

## Inputs

- `db/schema.ts`
- `lib/authz.ts`
- `lib/admin.ts`
- `app/admin/**`
- `lib/routes.ts`
- `.ai/state/decisions.md`

## Tasks

- Confirm `user_profiles.role = "admin"` is the admin source of truth.
- Confirm onboarding does not create admins.
- Define how operator identifies Clerk user id.
- Define exact DB insert/update shape for admin provisioning.
- Define admin access verification route and expected UI.
- Define demotion/removal procedure for accidental admin access.
- Define hard stop for any ambiguity around target user or target database.

## Verification Commands

- `rg -n "admin|requireRole|user_profiles|userRoleEnum|suspend" db/schema.ts lib/authz.ts lib/admin.ts app/admin lib/routes.ts`
- `git diff --check -- .ai/initiatives/production-readiness-admin-runbook .ai/state`

## Expected Evidence

- Runbook says admin creation is manual/operator-controlled.
- Runbook forbids public admin self-selection.
- Runbook includes rollback/removal.
- No admin is created during this phase unless a later execution prompt explicitly authorizes it.

## Repair Policy

Allowed repairs:

- Fix initiative/state markdown formatting only.

Hard-stop if the admin target user, target database, or provisioning authority is ambiguous.

## Completion Notes

Phase 2 completed on `2026-06-01`.

Observed admin truth:

- Admin role is `user_profiles.role = "admin"`.
- `requireRole(["admin"])` guards admin access.
- `/admin` uses `getAdminOverview()`, which calls `requireAdmin()`.
- Admin can view users/profiles, requests, and quotes.
- Admin can suspend/unsuspend forwarder companies.
- Onboarding does not create admins.

Runbook:

1. Operator creates or identifies the intended Clerk user outside public onboarding.
2. Operator confirms the Clerk user id from Clerk dashboard or a trusted Clerk admin API path.
3. Operator confirms target environment and `DATABASE_URL`.
4. Operator creates or updates exactly one `user_profiles` row:
   - `clerk_user_id = <confirmed Clerk user id>`
   - `role = "admin"`
   - `full_name = <operator-approved admin name>`
5. Admin signs in and verifies `/after-auth` routes to `/admin`.
6. Non-admin importer/forwarder accounts verify `/admin` denial.

Rollback/removal:

1. Confirm exact `user_profiles.id` and `clerk_user_id`.
2. If accidental admin should remain a normal user, update role to the intended role only after confirming matching business profile exists.
3. If accidental admin was a smoke/provisioning-only user, delete only exact smoke rows in dependency order or leave disabled pending human review.
4. Verify `/admin` is denied after demotion/removal.

Accepted issues:

- No admin seed script exists in repo.
- No production admin user is provisioned by this phase.
- Target environment and Clerk user id must be operator-confirmed before any admin write.
