# Module Sequence

## Phase 0: Current-State Audit

Trace current messaging implementation and verify WebSocket runtime/deployment support before designing anything.

Likely files:

- `db/schema.ts`
- `drizzle/`
- `lib/messages.ts`
- `lib/notifications.ts`
- `lib/authz.ts`
- `lib/routes.ts`
- `app/app/requests/messages/**`
- `app/app/forwarder/messages/**`
- `app/app/notifications/**`
- `package.json`
- `next.config.*`
- `render.yaml`

## Phase 1: Realtime Contract Design

Define event names, payloads, subscription model, auth checks, and frontend cache behavior.

Deliverable should be a narrow contract, not generic event infrastructure.

## Phase 2: Backend Transport Foundation

Add the minimum viable WebSocket endpoint, authenticated connection binding, authorized subscription handling, and disconnect cleanup.

Use in-memory connection tracking only if Phase 0 confirms single-instance/local acceptability.

## Phase 3: Backend Message Event Emission

Integrate post-commit event emission into the existing message creation flow.

Do not bypass current validation. Do not create a second message-writing path.

## Phase 4: Frontend Realtime Client

Add one small realtime client/provider and subscription hooks.

Hook into existing query/cache behavior. If React Query is not actually present, Phase 0 must identify the real cache/fetch mechanism and adapt without adding React Query unless already approved by repo truth.

## Phase 5: UI Behavior And Fallback

Wire conversation detail, conversation list, and unread/notification refresh behavior.

Realtime disconnected state should be subtle and only visible where useful.

## Phase 6: Verification And Hardening

Prove auth, privacy, event emission, deduplication, disconnect/reconnect recovery, REST fallback, and final static verification.

No final completion without automated evidence and a two-browser importer/forwarder smoke.
