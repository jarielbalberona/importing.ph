# Phase Report: UI Behavior And Fallback

Final status: `passed_with_issues`

## Executive Summary

Phase 5 wired realtime delivery into the importer and forwarder messaging UI while preserving REST/server-action fallback.

Accepted issue: full authenticated two-browser smoke was not completed in this execution turn, so realtime delivery is not browser-proven yet.

## Files Changed

- `app/app/requests/messages/importer-messages-client.tsx`
- `app/app/forwarder/messages/[conversationId]/page.tsx`
- `app/app/forwarder/messages/[conversationId]/forwarder-conversation-client.tsx`
- `app/app/forwarder/messages/forwarder-messages-realtime.tsx`

## Implementation Summary

Importer UI:

- subscribes to visible conversation IDs.
- appends active conversation messages from `conversation.message.created`.
- patches visible conversation list preview/date from `conversation.updated`.
- refreshes server-rendered data for canonical reconciliation.

Forwarder UI:

- active conversation page appends `conversation.message.created`.
- conversation list subscribes to visible conversation IDs and calls `router.refresh()` on `conversation.updated`.

Fallback:

- message send remains form/server-action based.
- socket disconnect does not block sending.
- reconnect triggers canonical refresh.
- deduplication uses `message.id`.

Unread:

- no fake read receipt or conversation unread model was added.
- current unread truth remains notification-level via `notifications.read_at`.

## Verification

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.

## Risks

- Browser timing and Clerk session behavior remain unproven until a two-user smoke is run.
- Conversation list updates are intentionally conservative and rely on server refresh for canonical order.

