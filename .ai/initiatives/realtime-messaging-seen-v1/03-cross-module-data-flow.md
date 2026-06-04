# Cross-Module Data Flow

## Mark Read

```text
conversation detail renders
-> client identifies latest incoming visible message
-> server action validates auth and conversation access
-> transaction advances conversation_read_states if newer
-> emit conversation.read_state.updated
-> subscribed sender UI updates Seen state
```

## Seen Display

```text
messages + read states
-> find current user's latest outgoing message
-> check another reader's last_read_message_id covers that message
-> show Seen only under that one outgoing message
```

## Recovery

```text
refresh/reconnect
-> server-rendered conversation includes read states
-> realtime patches are deduped by reader user profile
```

