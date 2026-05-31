# Domain Model

## Implemented Repo Terms

### Local PostgreSQL Database

The development database defined by `docker-compose.yml`.

Observed current values:

- Service: `postgres`.
- Image: `postgres:16-alpine`.
- Container name: `importing-ph-postgres`.
- Host port: `55432`.
- Container port: `5432`.
- Database: `importing_ph_dev`.
- User: `importing_ph`.

### DATABASE_URL

The environment variable used by both Drizzle Kit and the application database client.

Observed loading order:

1. `.env.local`
2. `.env` without overriding already-loaded values

Observed local example:

```text
postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

### Drizzle Schema

The TypeScript schema in `db/schema.ts`.

Implemented tables:

- `user_profiles`
- `importer_profiles`
- `forwarder_companies`
- `forwarder_members`

Implemented enum:

- `user_role` with `importer`, `forwarder`, and `admin`.

### Migration

Generated SQL under `drizzle/`.

Observed current migration:

- `drizzle/0000_large_scalphunter.sql`

The migration creates the profile-related tables and indexes currently required by onboarding proof.

### DB Smoke Check

The script `scripts/db-smoke.ts`.

Current behavior:

- Loads `DATABASE_URL`.
- Connects with `postgres`.
- Reads current database and user.
- Confirms required profile tables exist in `information_schema.tables`.
- Prints `DB smoke PASS` on success.

### Onboarding Proof

The script `scripts/prove-onboarding.ts`.

Current behavior:

- Refuses to run when `NODE_ENV === "production"`.
- Creates one importer profile path through `createOnboardingProfile`.
- Creates one forwarder company/member path through `createOnboardingProfile`.
- Reads back related rows.
- Prints inserted IDs.
- Deletes generated test users by generated Clerk user ids.

## Proof Tables

### user_profiles

Application user profile linked to Clerk by `clerk_user_id`.

Proof expectation:

- Importer and forwarder proof users are inserted.
- Cleanup deletes generated users.

### importer_profiles

Importer business profile linked to `user_profiles`.

Proof expectation:

- Importer proof creates one importer profile row.
- Row is read back by `user_profile_id`.

### forwarder_companies

Forwarder company record.

Proof expectation:

- Forwarder proof creates one company row.
- Row is read back through `forwarder_members.forwarder_company_id`.

### forwarder_members

Membership linking a user profile to a forwarder company.

Proof expectation:

- Forwarder proof creates one owner membership row.
- Row is read back by `user_profile_id`.

## Out-Of-Scope Domain Terms

These are intentionally not part of this initiative:

- Shipment request.
- Quote.
- Conversation.
- Message.
- Request status.
- Quote status.
- Payment.
- Shipment tracking.

## Data Safety Rules

- Proof scripts must run only against local/non-production databases.
- Any generated fixture rows must use unique identifiers.
- Any generated fixture rows must be cleaned up.
- Do not use real Clerk users or real customer data for this proof.
- Do not run destructive migration or reset commands unless a future human explicitly authorizes them.
