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

## Current Caution

Permission rules are seeded from code seams only. They are not yet a full security audit.
