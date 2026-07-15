# Integrations

Status: baseline / to be confirmed

Source: current repo inspection.

Current integrations visible in code and config:

- Clerk for authentication
- Render for deployment/runtime hosting
- PostgreSQL database provisioned through Render config
- Cloudflare R2 for private shipment-request and conversation-message attachment storage; browser message uploads use short-lived signed PUT URLs
- PSGC source data imported from external JSON files into database tables
- Resend for transactional email delivery
- React Email templates under `packages/email`
- React PDF templates under `packages/pdf`

Validation note:

- attachment and PSGC behavior includes migrated legacy root-doc content that still needs code/runtime confirmation when used for runtime claims
- Resend is the approved email service, but production delivery is not proven until `RESEND_API_KEY`, `EMAIL_FROM`, verified sender/domain setup, and a delivery smoke are completed in the target environment
