# Verification Checklist

## Static Verification

- [ ] `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- [ ] `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- [ ] `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`
- [ ] `node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only` after initiative is locked for execution.
- [ ] `git diff --check -- .ai/initiatives/realtime-messaging-v1 .ai/state`

## Database Verification

Run only if schema or migrations change.

- [ ] `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- [ ] `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`

## Backend Behavior

- [ ] Existing message create path still validates auth, participant access, and quote gate.
- [ ] Message row commits before realtime event emission.
- [ ] Event emission failure does not roll back committed message.
- [ ] Sender receives safe update or invalidation.
- [ ] Recipient receives safe update or invalidation.
- [ ] Competitor forwarder receives nothing.
- [ ] Unrelated importer receives nothing.
- [ ] Unauthorized subscription reveals no sensitive metadata.

## Frontend Behavior

- [ ] Client connects after auth.
- [ ] Client disconnects on logout.
- [ ] Reconnect uses backoff.
- [ ] Reconnect refetches current conversation.
- [ ] Reconnect refetches conversation list.
- [ ] Reconnect refetches unread state.
- [ ] Message deduplication uses message ID.
- [ ] Existing REST send/list still works when realtime is disabled.

## Manual Smoke

- [ ] Importer and forwarder logged in on separate browsers or isolated sessions.
- [ ] Importer sends message; forwarder sees it without manual refresh.
- [ ] Forwarder replies; importer sees it without manual refresh.
- [ ] Conversation list updates on new message.
- [ ] Unread count updates or refreshes.
- [ ] Unauthorized user cannot subscribe or receive events.
- [ ] Refresh recovers canonical state.
- [ ] Disconnect/reconnect recovers missed state.
- [ ] Realtime disabled/disconnected still allows REST send/list behavior.

## Final Reporting

- [ ] Phase reports exist for all phases.
- [ ] Final report exists.
- [ ] `00-overview.md` status reflects actual evidence.
- [ ] `.ai/state/current-state.md` updated.
- [ ] `.ai/state/known-risks.md` updated.
- [ ] `.ai/state/verification-status.md` updated.
- [ ] Single-instance vs multi-instance limitation is explicitly documented.
