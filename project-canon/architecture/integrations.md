# Integrations

Status: baseline / to be confirmed

Source: current repo inspection.

Current integrations visible in code and config:

- Clerk for authentication
- Render for deployment/runtime hosting
- PostgreSQL database provisioned through Render config
- Cloudflare R2 for private shipment request attachment storage
- PSGC source data imported from external JSON files into database tables

Potential/future integration surface:

- email-related runtime may exist, but durable delivery behavior is not asserted here yet

Validation note:

- attachment and PSGC behavior includes migrated legacy root-doc content that still needs code/runtime confirmation when used for runtime claims
