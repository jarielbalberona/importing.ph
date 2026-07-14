# Permissions

Status: baseline / to be confirmed

Source: current repo inspection.

Current permission model is role-based with additional relationship checks.

## Role Gates

- `requireRole(["importer"])` protects importer-only flows
- `requireRole(["forwarder"])` and `requireRole(["admin"])` are the expected pattern for role-gated surfaces
- users without profiles are redirected to onboarding
- unauthorized roles are redirected to `/unauthorized`

## Relationship Gates

- realtime conversation access checks importer ownership or forwarder-company membership before subscription
- importer profile views are intended to be more restricted than public forwarder company profiles
- forwarder quote access and messaging are tied to request/company relationships, not global visibility
- anyone may read an active non-draft `/r/{token}` page, but its query is a dedicated allowlisted projection that excludes importer identity, private addresses and notes, attachments, quotes, and internal IDs
- only the owning importer may create or edit a public link while a request is posted, rotate an active posted link, or disable an active link in any request state
- a public token grants no mutation permission; all quotation mutations remain behind authenticated forwarder role, membership, request-state, duplicate, and rate-limit checks

## Current Caution

Permission rules are seeded from code seams only. They are not yet a full security audit.
