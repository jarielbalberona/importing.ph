# Phase 6: Verification And Hardening

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Prove realtime messaging works without weakening database truth, auth, quote gating, or REST fallback.

## Files Likely Involved

- Tests under the repo's existing test locations.
- Realtime backend helpers.
- Message creation helpers.
- Realtime frontend hooks/components.
- `.ai/initiatives/realtime-messaging-v1/reports/**`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Implementation Notes

- Add focused tests for authorization and event emission where the repo's test setup supports it.
- Add frontend/cache tests for deduplication if the repo has a suitable test harness.
- Run final commands sequentially.
- Run two-session manual smoke for importer/forwarder realtime delivery.
- Document exact skip reasons if browser/auth fixtures are unavailable. Do not call realtime proven if smoke is skipped.

## Acceptance Criteria

- Automated verification passes or exact accepted issue is documented.
- Importer/forwarder realtime send-receive smoke passes.
- Unauthorized users cannot subscribe to or receive conversation events.
- Disconnect/reconnect recovers missed state.
- Browser refresh recovers canonical state from REST.
- Existing REST behavior works with realtime disabled/disconnected.
- Final report is written.
- Initiative overview/status is updated, but not beyond evidence.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`
- `node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only`
- `git diff --check -- .ai/initiatives/realtime-messaging-v1 .ai/state`

Run only if schema/migrations changed:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`

## Risks

- Browser auth/session setup can block manual smoke.
- Local success does not prove production if deployment target/runtime is unconfirmed.
- Multi-instance production can drop cross-instance events when using in-memory fanout.

## Rollback Notes

Rollback should disable or remove realtime transport/client wiring while leaving database-backed messaging intact. Existing message rows and REST behavior must not require cleanup.

## Completion Notes

Final automated verification passed and the custom server was smoke-tested locally.

Commands:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm test`: pass, 10 tests.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`: pass.
- `git diff --check`: pass.
- `node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only`: pass.

Runtime probes:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm start`: attempted; failed because local port `3001` was already in use.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH PORT=3101 NODE_ENV=production node server.mjs`: pass.
- `curl -I http://localhost:3101/`: pass, normal Next route returned `200`.
- Invalid WebSocket upgrade path `ws://localhost:3101/not-realtime`: pass, returned `404`.
- Realtime WebSocket path without token `ws://localhost:3101/api/realtime/ws`: pass, returned `401`.

Manual smoke:

- Full importer/forwarder two-browser authenticated smoke was not completed in this turn because no confirmed local Clerk smoke credentials were available in the prompt and creating/mutating smoke users was not part of the requested execution. Do not claim browser-proven realtime delivery until that smoke is run.

Final issue accepted: local automated and runtime verification pass, but authenticated browser realtime delivery remains unproven.
