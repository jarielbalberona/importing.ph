# Known Risks

- active: WebSocket is the locked V1 transport, but Phase 0 must prove persistent connection support in the current Node/Next.js plus Render setup before implementation.
- active: SSE is only a fallback if WebSocket persistent connections cannot be supported without unapproved infrastructure. Switching to SSE requires human confirmation because it changes the locked architecture.
- active: In-memory connection tracking only works reliably on a single process. Multi-instance deployment needs shared pub/sub, which is out of V1 unless current deployment makes it unavoidable.
- active: Realtime authorization is easy to get subtly wrong. Subscription checks must reuse participant and quote-gate logic, not copy/paste a weaker approximation.
- active: Events emitted before DB commit can create phantom messages in the UI. Emission must be post-commit.
- active: Client cache updates can duplicate messages when REST refetch and realtime event both deliver the same row. Deduplicate by message ID.
- active: Reconnect can miss events. Reconnect must invalidate/refetch current conversation, list, and unread state.
- active: Notification unread counts may not map cleanly to conversation unread counts. Phase 0 must identify current unread truth before adding invalidation.
- active: Production readiness cannot be claimed until target deployment/runtime confirms persistent WebSocket support and realtime smoke is passed.
- accepted: V1 does not guarantee delivery while a user is offline. REST refetch after return is the recovery path.
- accepted: V1 does not include typing indicators, presence, read receipts, push notifications, attachments, group chat, or external realtime providers.
