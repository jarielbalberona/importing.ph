# Phase 2 Report: Importer Onboarding Hardening

Final status: `passed`

## Summary

Phase 2 proved importer onboarding creates the expected PostgreSQL records and added narrow proof coverage for importer retry/idempotency behavior.

The implementation already short-circuited existing `user_profiles` rows. This phase extended `scripts/prove-onboarding.ts` so the importer path retries with the same generated Clerk-like id and a conflicting forwarder role request, then verifies:

- no second profile is created
- the existing importer role is not switched
- exactly one importer profile exists
- no forwarder membership is created for the importer retry

No application product behavior, Clerk configuration, schema, route guard, or marketplace feature code changed.

## Files Inspected

- `.ai/initiatives/auth-onboarding-roles/reports/phase-1-current-auth-onboarding-audit.md`
- `lib/onboarding.ts`
- `app/onboarding/actions.ts`
- `app/onboarding/page.tsx`
- `lib/routes.ts`
- `db/schema.ts`
- `scripts/prove-onboarding.ts`

## Files Changed

- `scripts/prove-onboarding.ts`
- `.ai/initiatives/auth-onboarding-roles/phases/phase-2-importer-onboarding-hardening.md`
- `.ai/initiatives/auth-onboarding-roles/reports/phase-2-importer-onboarding-hardening.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision file update was made.

## Implementation Summary

Added importer retry proof to `scripts/prove-onboarding.ts`.

The proof now records:

- `retryCreated: false`
- `retryRole: "importer"`
- `importerProfileCount: 1`

This proves retry submission does not duplicate importer business rows and does not silently switch role.

## Self-Heal Attempts

Attempt 1:

- Failure: `npm run db:prove-onboarding` failed with `ECONNREFUSED`.
- Root cause: local Docker/Postgres runtime was not available at the confirmed local DB target.
- Fix: verified `docker compose config` for the expected local Postgres service, started local Colima/Docker availability, then ran `docker compose up -d postgres`.
- Verification: `docker compose ps` showed `importing-ph-postgres` healthy on `0.0.0.0:55432->5432/tcp`; rerun of `db:prove-onboarding` passed.

## Database / Migration Changes

No schema or migration changes.

DB target used:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

No reset/drop/truncate command was run.

## Commands Run

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev node -e '<target validation>'
```

Result: pass. Target was `localhost:55432/importing_ph_dev`.

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:prove-onboarding
```

Initial result: fail with `ECONNREFUSED`.

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH docker compose config
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH docker compose ps
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH colima status
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH colima start
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH docker compose up -d postgres
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH docker compose ps
```

Result: local Docker/Postgres availability restored. `importing-ph-postgres` became healthy on port `55432`.

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:prove-onboarding
```

Result: pass. Output included:

```text
Onboarding proof PASS
"retryCreated": false
"retryRole": "importer"
"importerProfileCount": 1
```

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
```

Result: pass.

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev node - <<'JS'
select count generated dev_importer/dev_forwarder proof user rows
JS
```

Result: pass. Output: `generated_proof_user_rows=0`.

## Smoke Tests

Importer DB proof:

- Account/role: generated importer proof identity.
- Route: none; proof script calls onboarding write logic directly.
- Action: create importer profile, retry same generated Clerk-like id with conflicting forwarder role input.
- Expected DB state: one `user_profiles` importer row during proof, one `importer_profiles` row, no forwarder membership, generated rows cleaned up.
- Actual result: proof passed and cleanup count was `0`.
- Verdict: pass.

## Auth / Privacy / Security Impact

No auth or role guard behavior changed. Business role truth remains in PostgreSQL. No Clerk metadata was introduced.

## Verification Summary

- Passed after self-heal: all required Phase 2 verification.
- Failed initially: DB proof due to local Docker/Postgres availability.
- Skipped: browser smoke; Phase 5 scope.

## Risks And Limitations

- resolved: Importer retry/idempotency is now proven by `scripts/prove-onboarding.ts`.
- active: Forwarder retry/idempotency still needs Phase 3 proof.
- accepted: Local Docker/Postgres may need to be started before DB proof commands.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Next Phase

`phase-3-forwarder-onboarding-hardening`

It is safe to continue. Phase 3 should add or verify forwarder retry/idempotency proof without introducing trust status, manual approval, shipment, quote, or messaging scope.
