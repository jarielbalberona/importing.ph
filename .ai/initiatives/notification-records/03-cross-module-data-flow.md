# Cross-Module Data Flow

## Quote Submitted Flow

```text
forwarder submits quote
-> quote action validates request eligibility and forwarder company membership
-> quote row is created
-> importer owner recipient is derived from request ownership
-> notification record created with dedupe key
-> quote action completes
```

Recipient:

- importer owner user profile for the request.

Privacy boundary:

- Notification may say a quote was received.
- Notification must not expose quote details to anyone except the importer owner.

## Message Reply Flow

```text
message create action
-> participant and quote gate verified
-> message row is created
-> recipient side derived from conversation participants
-> notification record created for recipient user profile(s)
-> message action completes
```

Recipient rules:

- If importer sends, notify eligible user profiles in the quoted forwarder company.
- If forwarder sends, notify the importer owner.

Privacy boundary:

- Notification should link to the conversation.
- Avoid putting sensitive message body in notification text unless the recipient is already authorized.

## Quote Decision Flow

```text
importer accepts/rejects quote
-> importer ownership verified
-> quote/request status updated transactionally
-> submitting forwarder company recipients derived
-> notification record created with decision type
```

Recipient:

- user profiles in the submitting forwarder company.

Privacy boundary:

- Only the submitting forwarder should receive accepted/rejected status for its quote.
- Competitor forwarders must not learn which quote was selected or rejected.

## New Matching Request Flow

```text
importer posts request
-> request visibility/matching rules evaluated
-> eligible forwarder companies resolved
-> recipient user profiles derived from memberships
-> notification records created
```

Hard stop if:

- request matching rules are not implemented
- all-forwarder broadcast would create spam or privacy risk
- recipient derivation is ambiguous

## Quote Expiring Soon Flow

```text
quote has valid_until
-> notification list/view or explicit user action checks expiring quotes
-> recipient importer notification created if not already created
```

No background scheduler is authorized in V1. If an expiring-soon notification requires cron, worker, queue, or external scheduler, skip it and document the gap.

## Notification Read Flow

```text
/app/notifications or workspace equivalent
-> requireProfile()
-> select notifications where recipient_user_profile_id = current profile id
-> render list
-> mark read action repeats recipient check
```

Critical boundary:

- Notification authorization is based on recipient user profile id. Role alone is not enough.

## Failure Behavior

Default V1 rule:

- Core business write should remain the priority.
- Notification creation failure should be recorded and surfaced during verification.
- Do not roll back quote/message/decision actions because of notification creation unless notification creation is part of the same required invariant.

If implementation cannot safely recover from notification failure, hard-stop and choose a transaction policy before continuing.
