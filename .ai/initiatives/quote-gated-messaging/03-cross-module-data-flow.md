# Cross-Module Data Flow

## Conversation Open Flow

```text
quote exists
-> request + importer owner exists
-> forwarder company exists
-> get-or-create conversation by request + forwarder company
-> conversation detail route
```

Critical boundaries:

- Conversation creation must be impossible before quote submission.
- Conversation identity must not be user-to-user. It is request-to-forwarder-company.
- Do not create duplicate conversations for multiple members of the same forwarder company.

## Importer Messaging Flow

```text
/app/requests/[requestId]/messages/[conversationId]
-> requireRole(["importer"])
-> importer profile lookup
-> request lookup by id and importer_profile_id
-> conversation lookup by request id
-> quote gate verifies conversation forwarder submitted quote
-> messages ordered by created_at
-> create message action repeats all checks
```

Allowed:

- Importer owner reads all messages in conversations for its own request.
- Importer owner sends messages to forwarder companies that quoted that request.

Forbidden:

- Importer reads another importer's conversation.
- Importer starts a conversation with a forwarder that has not quoted.

## Forwarder Messaging Flow

```text
/app/forwarder/messages/[conversationId]
-> requireRole(["forwarder"])
-> forwarder member/company lookup
-> conversation lookup by forwarder_company_id
-> quote gate verifies company quote on request
-> messages ordered by created_at
-> create message action repeats all checks
```

Allowed:

- Forwarder company member reads and sends messages for the company's quoted request.

Forbidden:

- Forwarder company reads competitor conversations.
- Forwarder company starts messages for a request it did not quote.
- Suspended forwarder write behavior must follow completed product/auth memory if suspension exists.

## No-Quote Blocked Flow

```text
request exists
-> no quote for request + forwarder company
-> no conversation row
-> no message creation
-> deny without leaking participant or quote details
```

The blocked state should be boring: not found, redirect, or unauthorized according to existing route patterns. Do not expose a detailed reason that leaks marketplace activity.

## Message Creation Flow

```text
message form submit
-> server action
-> require profile and role
-> load conversation
-> verify participant
-> verify quote gate
-> validate body
-> insert message
-> redirect/revalidate conversation detail
```

Validation rules to define in execution:

- non-empty body
- maximum body length
- plain text only
- no attachments

## Future Notification Event Notes

No notifications are built here.

Future notification records could consume:

- conversation opened after quote
- message created

This initiative must not add queues, email sending, webhook infrastructure, notification tables, realtime subscriptions, or background workers.
