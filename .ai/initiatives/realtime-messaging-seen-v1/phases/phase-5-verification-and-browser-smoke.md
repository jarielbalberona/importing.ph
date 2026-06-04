# Phase 5: Verification And Browser Smoke

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Verify read-state behavior without weakening realtime messaging.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm test`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`
- `git diff --check`
- `node tools/ai-runner/index.mjs realtime-messaging-seen-v1 --check-only`

## Browser Smoke

- importer `a1+clerk_test@clerk.com`
- forwarder `a2+clerk_test@clerk.com`
- prove bidirectional seen state and refresh persistence.

## Execution Notes

- Local server: `NODE_ENV=production node server.mjs` on `http://localhost:3001`.
- Conversation: `cf68b210-6a61-4e76-80bd-c91178c51cf8`.
- Importer message: `Importer seen smoke 1780590285739`.
- Forwarder message: `Forwarder seen smoke 1780590335699`.
- Importer-to-forwarder realtime message delivery passed.
- Forwarder-to-importer realtime message delivery passed.
- `Seen` appeared once on each side under the sender's latest outgoing message.
- Refresh persistence passed on both sides.
- `/api/realtime/token` POST passed for an authenticated forwarder.
- Unauthenticated `/api/realtime/ws` returned `401`.
- Invalid WebSocket path returned `404`.
- Unauthorized subscription returned `realtime.error` with `forbidden`.
- Accepted issue: in-app browser text-entry helpers failed because the local browser bridge reported a missing virtual clipboard. The smoke used isolated browser sessions and captured screenshots/logs instead.

## Rollback Notes

Rollback should preserve messages and remove only seen/read-state behavior.
