# Environments

Status: baseline plus local port map / needs runtime confirmation

Source: current repo inspection, workspace local port block decision, and bounded migrated reference from legacy root docs.

Current environment/runtime signals:

- local web defaults to `http://localhost:5001`
- local PostgreSQL is exposed on host port `5032` and container port `5432`
- SEO rendered-page tooling targets `http://localhost:5001` by default
- importing.ph is web-only in this repo; no local mobile/Metro port is assigned
- no separate local Go API port is assigned
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
