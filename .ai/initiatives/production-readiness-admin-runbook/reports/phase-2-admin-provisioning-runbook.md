# Phase Report: Admin Provisioning Runbook

Final status: `passed_with_issues`

## Summary

Phase 2 documented a safe manual admin provisioning and rollback procedure from current code truth. No admin account was created, no database write was run, and no application code changed.

## Files Changed

- `.ai/initiatives/production-readiness-admin-runbook/00-overview.md`
- `.ai/initiatives/production-readiness-admin-runbook/phases/phase-2-admin-provisioning-runbook.md`
- `.ai/initiatives/production-readiness-admin-runbook/reports/phase-2-admin-provisioning-runbook.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## No-Application-Code Confirmation

No application code changed. This phase was runbook/memory execution only.

## Admin Model Findings

Observed from repo:

- `db/schema.ts` defines `user_role` enum values `importer`, `forwarder`, and `admin`.
- `user_profiles.role` is the business role source of truth.
- `lib/authz.ts` implements `requireRole()` and redirects wrong-role users to `/unauthorized`.
- `lib/routes.ts` maps admin users to `/admin`.
- `lib/admin.ts` gates admin overview and suspension actions through `requireRole(["admin"])`.
- `app/admin/page.tsx` renders users/profiles, shipment requests, quotes, and forwarder suspension controls.
- `app/admin/actions.ts` validates UUID/reason input and delegates suspension/unsuspension to admin-only helpers.
- Ordinary onboarding does not create admin users.

## Admin Provisioning Runbook

Use this only after confirming target environment and target database.

1. Create or identify the intended admin user in Clerk.
2. Confirm the Clerk user id from Clerk dashboard or trusted Clerk admin API output.
3. Confirm the target DB is the intended staging/production database, not local dev.
4. Confirm whether the user already has a `user_profiles` row.
5. If no row exists, insert one `user_profiles` row with:
   - `clerk_user_id = <confirmed Clerk user id>`
   - `role = "admin"`
   - `full_name = <operator-approved admin name>`
6. If a row exists, update only that exact row to `role = "admin"` after confirming the account is intended to become admin.
7. Sign in as the admin user.
8. Visit `/after-auth` and verify redirect to `/admin`.
9. Visit `/admin` and verify users, requests, and quotes render.
10. Sign in as a non-admin importer/forwarder and verify `/admin` is denied.

Hard stop:

- If the Clerk user id, target DB, or intended admin owner is ambiguous, do not write anything.
- Do not make admin selectable in onboarding.
- Do not store admin business truth in Clerk metadata.

## Rollback / Removal Runbook

1. Confirm exact `user_profiles.id` and `clerk_user_id`.
2. If the account should remain a normal user, update role only to the approved target role after verifying matching business profile rows.
3. If it is a disposable admin smoke account, remove exact smoke-owned records in dependency order or leave the row disabled pending human approval if relationships are unclear.
4. Verify `/admin` denial after demotion/removal.

## Database / Migration Safety Impact

No DB command was run. Admin provisioning remains a future operator-controlled write and requires explicit target confirmation.

## Auth / Privacy / Security Impact

This runbook preserves current auth boundaries:

- Clerk authenticates only.
- PostgreSQL owns admin role.
- Public onboarding must not create admins.
- Wrong-role users go to `/unauthorized`.

## Commands Run

- `rg -n "admin|requireRole|user_profiles|userRoleEnum|suspend" db/schema.ts lib/authz.ts lib/admin.ts app/admin lib/routes.ts`: pass.
- `sed -n '1,220p' lib/authz.ts; sed -n '1,180p' lib/routes.ts; sed -n '1,220p' lib/admin.ts; sed -n '1,180p' app/admin/actions.ts; sed -n '1,220p' app/admin/page.tsx`: pass.
- `git diff --check -- .ai/initiatives/production-readiness-admin-runbook .ai/state`: pass.

## Verification Summary

- Passed: 3.
- Failed: 0.
- Skipped: admin DB write and browser verification because this phase defines the runbook only.

## Self-Heal Attempts

None.

## Unrelated Drift Classification

Pre-existing dirty worktree changes were preserved. This phase changed only initiative/state/report files.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Decisions Updated

No new durable decision was added. Existing decision `2026-06-01: Admin Provisioning Remains Manual For V1` already covers the policy.

## Risks And Limitations

- active: No admin seed script exists in repo.
- active: Actual target DB and Clerk user id must be operator-confirmed before admin provisioning.
- accepted: Manual admin provisioning is acceptable for V1 controlled validation because public admin self-registration would be a bad security trade.

## Next Phase

Proceed to Phase 3: `phase-3-target-database-migration-and-safety-plan`.

Autonomous execution continued.
