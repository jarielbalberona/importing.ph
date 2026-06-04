# Phase 5 Report: Verification And Browser Smoke

Verdict: PASS WITH ISSUES

Local browser smoke proved bidirectional realtime message delivery plus conversation-level seen state.

## Smoke Inputs

- Server: `NODE_ENV=production node server.mjs`
- URL: `http://localhost:3001`
- Importer: `a1+clerk_test@clerk.com`
- Forwarder: `a2+clerk_test@clerk.com`
- Conversation: `cf68b210-6a61-4e76-80bd-c91178c51cf8`
- Importer message: `Importer seen smoke 1780590285739`
- Forwarder message: `Forwarder seen smoke 1780590335699`

## Results

- Importer message reached forwarder without manual refresh.
- Forwarder viewing the conversation advanced read state.
- Importer saw `Seen` under the latest outgoing importer message.
- Forwarder reply reached importer without manual refresh.
- Importer viewing the conversation advanced read state.
- Forwarder saw `Seen` under the latest outgoing forwarder message.
- Refresh on both sides preserved messages and seen state from PostgreSQL.
- Duplicate count for each smoke message after refresh was `1`.
- Authenticated `/api/realtime/token` POST returned `200`.
- Unauthenticated `/api/realtime/ws` returned `401`.
- Invalid WebSocket path returned `404`.
- Unauthorized subscription returned `realtime.error` code `forbidden`.

## Evidence

- `/tmp/realtime-seen-importer-before.png`
- `/tmp/realtime-seen-forwarder-before.png`
- `/tmp/realtime-seen-forwarder-after-importer.png`
- `/tmp/realtime-seen-importer-seen.png`
- `/tmp/realtime-seen-importer-after-forwarder.png`
- `/tmp/realtime-seen-forwarder-seen.png`
- `/tmp/realtime-seen-importer-after-refresh.png`
- `/tmp/realtime-seen-forwarder-after-refresh.png`
- `/tmp/realtime-seen-visible-state.json`
- `/tmp/realtime-seen-security-probes.json`

## Accepted Issue

The Codex in-app browser text-entry helpers failed with a virtual clipboard error. Smoke used isolated authenticated browser sessions for entry and screenshots, while the in-app browser was used to inspect the importer conversation.
