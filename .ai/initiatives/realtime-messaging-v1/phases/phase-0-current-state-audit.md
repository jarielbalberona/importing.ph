# Phase 0: Current-State Audit

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Audit the current database-backed messaging system, authorization gates, frontend data flow, and persistent WebSocket deployment/runtime support before implementation.

## Files Likely Involved

- `.ai/core/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/initiatives/quote-gated-messaging/**`
- `.ai/initiatives/notification-records/**`
- `.ai/initiatives/production-readiness-admin-runbook/**`
- `db/schema.ts`
- `drizzle/`
- `lib/messages.ts`
- `lib/notifications.ts`
- `lib/authz.ts`
- `lib/routes.ts`
- `app/app/requests/messages/**`
- `app/app/forwarder/messages/**`
- `app/app/notifications/**`
- `components/**`
- `hooks/**`
- `package.json`
- `next.config.*`
- `render.yaml`

## Implementation Notes

- This phase is read-only for application code.
- Trace actual current code, not older initiative assumptions.
- Identify whether message creation is a server action, route handler, form action, REST endpoint, or mixed pattern.
- Confirm message creation remains REST/API-first for V1.
- Identify current cache/fetch behavior. If React Query is absent, say so and do not add it by assumption.
- Identify how unread counts exist today, if they exist at all.
- Confirm whether Render/current Node runtime can support persistent WebSocket connections cleanly.
- Document SSE only as a fallback if WebSocket cannot be supported without unapproved infrastructure.

## Acceptance Criteria

- Current messaging schema and indexes are documented.
- Current message create/list path is documented.
- Current conversation participant authorization is documented.
- Quote/request gating is traced to concrete functions/queries.
- Current frontend data-fetch/cache behavior is documented.
- Current notification/unread behavior is documented.
- Current WebSocket deployment/runtime constraints are documented.
- WebSocket implementation viability is stated with evidence.
- SSE fallback is documented only if persistent WebSocket support is blocked.
- No application code changes are made.

## Verification Commands

- `git status --short`
- `rg -n "conversation|conversations|message|messages|notification|unread|quote" db lib app components hooks`
- `rg -n "useQuery|QueryClient|queryKey|revalidatePath|fetch\\(" app components lib hooks package.json`
- `rg -n "websocket|ws|sse|eventsource|upgrade|server-sent|socket" app lib package.json next.config.* render.yaml`
- `test -f render.yaml`

## Risks

- Older `.ai` notes may be stale; repo code wins.
- WebSocket may require runtime changes that violate monolith/simple V1 constraints.
- Unread state may be notification-based rather than conversation-based.

## Rollback Notes

No app code should change. Revert only this phase report/status if the audit write-up is wrong.

## Completion Notes

Phase 0 audited current messaging, auth, cache/query, notification/unread, and runtime/deployment support. Final report: `../reports/phase-0-current-state-audit.md`.

Verdict: `PASS WITH ISSUES`.

Key issue: WebSocket is viable on Render Node web services, but the current `next start` setup has no application-owned HTTP server/upgrade hook. Phase 1 must plan a minimal custom Node server or equivalent app-owned HTTP server attachment before Phase 2 implementation.
