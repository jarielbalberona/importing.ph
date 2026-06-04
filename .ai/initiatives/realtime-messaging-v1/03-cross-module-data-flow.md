# Cross-Module Data Flow

## Message Send Flow

```text
message form/client
-> existing REST route or server action
-> auth/session check
-> user_profiles lookup
-> conversation participant check
-> quote/request gate check
-> messages insert in PostgreSQL
-> transaction commits
-> realtime emitter publishes conversation.message.created
-> sender and recipient clients update or invalidate cache
-> REST remains fallback for recovery
```

## Connection Flow

```text
authenticated browser
-> realtime endpoint
-> Clerk/session validation
-> user_profiles binding
-> realtime.connected event
-> subscribe to conversation IDs only after server authorization
```

## Subscription Flow

```text
client requests conversation subscription
-> server resolves user profile
-> server checks conversation participant access
-> server registers connection for conversation
-> unauthorized request is rejected without payload leakage
```

## Conversation List Flow

```text
message commit
-> conversation.updated event
-> participant clients invalidate or update conversation list query/cache
-> REST list fetch remains canonical
```

## Unread Refresh Flow

```text
message commit
-> conversation.unread.changed event for affected recipient(s)
-> client invalidates unread count or notification query/cache
-> REST refetch computes canonical unread state
```

## Reconnect Recovery Flow

```text
connection drops
-> client marks realtime degraded if useful
-> reconnect with backoff
-> authenticate again
-> resubscribe to visible conversation/list scope
-> invalidate/refetch current conversation, conversation list, and unread counts
```

## Single-Instance Limitation

If Phase 2 uses an in-memory fanout registry, events only reach clients connected to the same running process.

That is acceptable for local proof or a confirmed single-instance deployment. It is not enough for horizontally scaled production. Multi-instance deployment requires a shared pub/sub layer such as Redis or a deployment-native equivalent, but that is explicitly not V1 unless Phase 0 proves it is required by the current architecture.
