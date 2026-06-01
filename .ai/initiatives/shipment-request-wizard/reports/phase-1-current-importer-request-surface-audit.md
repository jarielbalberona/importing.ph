# Phase 1 Report: Current Importer Request Surface Audit

Final status: `passed`

## Summary

Phase 1 audited the current importer request surface before implementing shipment request creation.

The repo currently has only an importer proof route. There is no shipment request schema, migration, server action, wizard route, importer list, or importer detail implementation. Later phases must add those deliberately without pulling in forwarder browsing, quote submission, messaging, file storage, or operations tooling.

## Files Inspected

- `.ai/initiatives/shipment-request-wizard/00-overview.md`
- `.ai/initiatives/shipment-request-wizard/01-domain-model.md`
- `.ai/initiatives/shipment-request-wizard/02-module-sequence.md`
- `.ai/initiatives/shipment-request-wizard/03-cross-module-data-flow.md`
- `.ai/initiatives/shipment-request-wizard/04-verification-plan.md`
- `.ai/initiatives/shipment-request-wizard/phases/phase-1-current-importer-request-surface-audit.md`
- `app/app/requests/page.tsx`
- `app/app/forwarder/requests/page.tsx`
- `app/admin/page.tsx`
- `app/onboarding/actions.ts`
- `lib/onboarding.ts`
- `lib/authz.ts`
- `lib/routes.ts`
- `db/schema.ts`
- `drizzle/0000_large_scalphunter.sql`
- `drizzle/meta/0000_snapshot.json`
- `drizzle/meta/_journal.json`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components.json`
- `package.json`

## Files Changed

- `.ai/initiatives/shipment-request-wizard/phases/phase-1-current-importer-request-surface-audit.md`
- `.ai/initiatives/shipment-request-wizard/reports/phase-1-current-importer-request-surface-audit.md`
- `.ai/initiatives/shipment-request-wizard/00-overview.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No application code, schema, migrations, package files, or tests were changed in this audit phase.

No decision file update was made.

## Current Importer Route Truth

- `app/app/requests/page.tsx` is the current importer workspace route.
- It calls `requireRole(["importer"])`.
- It renders a proof route card stating the current user's PostgreSQL role allows access.
- It includes `UserButton`.
- It does not query shipment requests.
- It does not render a request list.
- It does not expose a create-request entry point.
- It does not have a request detail route.

## Current Schema And Migration Truth

Implemented tables:

- `user_profiles`
- `importer_profiles`
- `forwarder_companies`
- `forwarder_members`

Implemented enum:

- `user_role` with `importer`, `forwarder`, and `admin`.

Current migrations:

- One initial migration exists: `drizzle/0000_large_scalphunter.sql`.
- No shipment request migration exists.
- No request-related enum exists.
- No request-related indexes exist.

## Current Action And Validation Patterns

Observed write pattern:

- `app/onboarding/actions.ts` defines a server action.
- It uses Clerk `auth()` to require identity.
- It validates `FormData` using a Zod schema defined in `lib/onboarding.ts`.
- It delegates persistence to a library helper.
- It redirects after success.

Required implication for later phases:

- Request creation should use the same server-action and Zod-validation style unless a phase documents a better repo-local reason.
- Route guard alone is not enough; request creation actions must re-check importer role/profile server-side.

## Current UI Conventions

Available UI primitives:

- `Button`
- `Input`
- `Label`

Design system:

- shadcn-style `new-york`
- Tailwind CSS v4
- lucide icon library configured
- App Router server components by default

Current importer/forwarder/admin workspace pages use:

- muted full-screen background
- constrained `max-w-5xl` content area
- compact header
- bordered card sections

Later request UI should stay operational and compact.

## Gaps For Later Phases

- No `shipment_requests` table.
- No request cargo, delivery, shipping, or status enums.
- No importer ownership relation from request to `importer_profiles`.
- No request creation server action.
- No request validation helper.
- No quoting-basis validation.
- No `/app/requests/new` route.
- No importer request list.
- No importer request detail route.
- No request smoke scripts.
- No browser smoke for importer request creation.

## Commands Run

```bash
node tools/ai-runner/index.mjs shipment-request-wizard --check-only
```

Result: pass.

```bash
git status --short
```

Result: pass; dirty worktree recorded and preserved.

```bash
test -f app/app/requests/page.tsx
test -f db/schema.ts
test -d drizzle
test -f lib/authz.ts
test -f lib/routes.ts
test -f components/ui/button.tsx
test -f components/ui/input.tsx
test -f components/ui/label.tsx
```

Result: pass.

## Verification Summary

- Passed commands: 3.
- Failed commands: 0.
- Skipped commands: later-phase implementation checks and browser smoke.

## Self-Heal Attempts

None.

## Database / Migration Changes

None.

## Auth / Privacy / Security Impact

None. This phase only audited the current importer route and supporting repo structure.

## Unrelated Drift Classification

The worktree contains prior `.ai` state/report changes from completed `local-db-migration-proof` and `auth-onboarding-roles` execution. Phase 1 preserved them.

## Risks And Limitations

- active: request schema and ownership do not exist yet.
- active: later phases must not expose importer request data to forwarders until `forwarder-open-requests` defines visibility.
- active: file attachments must stay placeholder-only in this initiative unless a later approved scope adds real storage.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Next Phase Readiness

It is safe to continue to `phase-2-request-domain-and-schema-plan`.
