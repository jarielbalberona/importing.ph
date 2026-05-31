# Cross-Module Data Flow

## Importer Comparison Flow

```text
/app/requests/[requestId]
-> requireRole(["importer"])
-> importer profile lookup
-> request lookup by id and importer_profile_id
-> quote list for request
-> importer comparison DTO
-> render comparison UI
```

Critical boundaries:

- Importer ownership must be checked before loading quote details.
- Non-owner importer must receive not-found, redirect, or equivalent denial with no quote data.

## Accept Quote Flow

```text
accept quote action
-> requireRole(["importer"])
-> importer ownership check
-> quote lookup within owned request
-> status/expiration validation
-> transaction
-> mark selected quote accepted
-> update request selected state/status
-> handle non-selected quotes according to approved rule
-> redirect/revalidate request detail
```

Concurrency requirements:

- Prevent two accepted quotes for one request.
- Re-check quote/request status inside the transaction.
- Do not accept expired quotes unless explicitly approved.

## Reject Quote Flow

```text
reject quote action
-> requireRole(["importer"])
-> importer ownership check
-> quote lookup within owned request
-> status validation
-> transaction
-> mark quote rejected
-> redirect/revalidate request detail
```

Hard boundaries:

- Rejecting an accepted quote requires product decision for unaccept/reopen behavior.
- Reject action must not affect competitor visibility.

## Forwarder Own Quote Flow After Decision

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> forwarder company lookup
-> own quote lookup
-> own quote status visible
-> no competitor quote details
```

Allowed:

- Forwarder sees whether its own quote is accepted/rejected/submitted.

Forbidden:

- Forwarder sees another forwarder's quote status, amount, identity, transit time, inclusions, exclusions, or notes.

## Competitor Forwarder Flow After Decision

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> request lookup
-> aggregate metadata only
-> no quote details
```

Acceptance/rejection must not create a new leakage channel through counts, IDs, URLs, labels, or status text.

## Future Notification Event Notes

No notifications are built here.

Future notification records could consume:

- quote accepted
- quote rejected
- request quote selected

This initiative should not add queues, notification tables, email sending, or webhook infrastructure.
