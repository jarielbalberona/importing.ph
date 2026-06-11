# Troubleshooting

Status: baseline / to be confirmed

Source: current repo inspection and bounded migrated reference from legacy root docs.

High-signal operational checks currently visible in repo:

- `npm run type-check`
- `npm run test`
- `npm run db:check`
- `npm run db:smoke`
- `npm run db:prove-onboarding`
- `npm run seo:test`
- `npm run seo:verify`

Known bounded troubleshooting areas:

- missing `DATABASE_URL` fails Drizzle config and custom server startup
- missing realtime secret falls back to `CLERK_SECRET_KEY`, otherwise startup/runtime errors are expected
- missing PSGC import leaves destination lookup unusable
- missing R2 config should fail attachment flow rather than silently fallback

Migrated reference note:

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- role-switch smoke should use separate browser contexts or a full Clerk storage reset instead of product-code bypasses
- attachment verification should confirm private object storage wiring, type/size rejection paths, and authorization before claiming the flow works in a target environment
