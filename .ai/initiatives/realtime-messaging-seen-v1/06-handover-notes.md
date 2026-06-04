# Handover Notes

## Current Status

Execution is in progress.

## Rule To Preserve

Do not add socket writes. Read-state writes go through server actions and PostgreSQL first.

## Forwarder Semantics

Seen is per active forwarder user profile. Do not summarize it as "company seen" until the product has an assigned participant or company-level read model.

## Next Step

Finish implementation, run static verification, and run browser smoke with the known Clerk smoke users.

