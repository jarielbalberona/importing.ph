# Phase 1 Report: Current Forwarder Request Audit

Final status: `passed`

## Summary Of Changes

Audit-only phase. No application code, schema, migrations, package scripts, or feature files were changed.

The forwarder route is currently a proof page at `app/app/forwarder/requests/page.tsx`. It calls `requireRole(["forwarder"])`, renders the signed-in forwarder's name, and does not query shipment requests.

## Files Changed

- `.ai/initiatives/forwarder-open-requests/phases/phase-1-current-forwarder-request-audit.md`
- `.ai/initiatives/forwarder-open-requests/reports/phase-1-current-forwarder-request-audit.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Baseline And Gaps

- Dependencies: `local-db-migration-proof`, `auth-onboarding-roles`, and `shipment-request-wizard` all have final reports. The accepted issues do not block this initiative.
- Shipment request schema exists in `db/schema.ts` and migration `drizzle/0001_parallel_blonde_phantom.sql`.
- Available request fields: status, cargo description, cargo type, CBM, weight, package count, dimensions, declared value, origin, destination, delivery preference, shipping preference, notes, attachment notes, timestamps, and importer profile owner id.
- Current request statuses are `draft`, `posted`, and `cancelled`; there is no `closed` status yet.
- Current indexes exist for importer profile, status, and created-at ordering.
- No quote tables exist yet. Quote count is not implementable in this initiative without scope expansion.
- No suspended forwarder field exists on `forwarder_companies`, `forwarder_members`, or `user_profiles`.
- Existing auth helper redirects wrong-role users to their own role destination; this is an accepted known issue from `auth-onboarding-roles`.

## Privacy Findings

- The current proof route does not expose request or quote data.
- Future forwarder list/detail queries must use an explicit forwarder-safe DTO.
- Importer identity/company information should not be exposed unless a later product rule requires it. Request fields needed for quoting are enough for V1 browsing.
- Quote fields must remain absent because no quote schema exists yet.

## Verification Summary

- Passed: 2 command groups.
- Failed: 0.
- Skipped: 0.

## Commands Run

- `git status --short && test -f app/app/forwarder/requests/page.tsx && test -f db/schema.ts && test -d drizzle && test -f lib/authz.ts && test -f lib/routes.ts`: pass.
- `node tools/ai-runner/index.mjs forwarder-open-requests --check-only`: pass; output was `Preflight passed for forwarder-open-requests.`

## Repairs Attempted

None.

## Unrelated Drift Classification

Existing dirty worktree changes from completed dependency initiatives were preserved. They include auth/onboarding reports, shipment request app/schema/migration files, and shared `.ai/state` updates.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision update was made.

## Risks And Limitations

- active: Forwarder browsing is not implemented until later phases replace the proof route.
- active: Quote count must remain absent until a quote schema exists.
- accepted: Suspended-forwarder browsing behavior is not applicable yet because no suspension state exists.
- accepted: Wrong-role redirects go to the user's role destination instead of `/unauthorized`.

## Next Phase Readiness

Ready for Phase 2: `phase-2-visibility-and-privacy-plan`.
