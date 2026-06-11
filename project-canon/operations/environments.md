# Environments

Status: baseline / to be confirmed

Source: current repo inspection and bounded migrated reference from legacy root docs.

Observed local/development signals:

- local dev server runs on port `3001`
- `.env` and `.env.local` are used
- Next.js app uses a custom Node server process for production start

Expected environment-sensitive dependencies:

- `DATABASE_URL`
- Clerk publishable/secret keys
- realtime signing secret or Clerk secret fallback
- R2 attachment storage variables when attachment flow is enabled
- PSGC source files for import operations

Migrated reference note:

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- target environments that need destination lookup must run PSGC import against their own database
- PSGC JSON source files are intentionally excluded from git and must be provided to the target environment or operator-run import context
