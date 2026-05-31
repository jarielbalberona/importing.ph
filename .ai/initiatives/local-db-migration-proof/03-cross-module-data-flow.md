# Cross-Module Data Flow

## Migration Flow

```text
.env.local or .env
-> DATABASE_URL
-> drizzle.config.ts
-> npm run db:migrate
-> drizzle/ migration files
-> Docker Compose PostgreSQL
-> profile tables and user_role enum
```

Critical boundary:

- `DATABASE_URL` must target the intended local database before migration execution.
- Execution must stop if the URL points at production or an unknown remote database.

## Schema Check Flow

```text
db/schema.ts
-> drizzle.config.ts
-> npm run db:check
-> drizzle migration metadata
```

Critical boundary:

- `db/schema.ts` and `drizzle/` metadata must not silently drift.
- Any drift must be recorded with exact command output.

## DB Smoke Flow

```text
.env.local or .env
-> DATABASE_URL
-> scripts/db-smoke.ts
-> postgres client
-> information_schema.tables
-> required table list
-> DB smoke PASS/FAIL output
```

Required tables:

- `user_profiles`
- `importer_profiles`
- `forwarder_companies`
- `forwarder_members`

## Onboarding Proof Flow

```text
.env.local or .env
-> DATABASE_URL
-> scripts/prove-onboarding.ts
-> db/index.ts
-> lib/onboarding.ts
-> db/schema.ts
-> user_profiles
-> importer_profiles
-> forwarder_companies
-> forwarder_members
-> cleanup generated fixture rows
```

Expected importer path:

```text
generated importer Clerk id
-> createOnboardingProfile(role=importer)
-> user_profiles row
-> importer_profiles row
-> read back importer_profiles by user_profile_id
-> cleanup generated user profile
```

Expected forwarder path:

```text
generated forwarder Clerk id
-> createOnboardingProfile(role=forwarder)
-> user_profiles row
-> forwarder_companies row
-> forwarder_members row
-> read back forwarder_members and forwarder_companies
-> cleanup generated user profile
```

## External Services

Clerk is not called by this proof.

The proof uses generated Clerk-like user ids as local identifiers only. It must not require real Clerk API calls, real Clerk users, or Clerk metadata changes.

Render is not part of this proof.

## Data Safety

- Local proof must not use production databases.
- Proof rows must use generated identifiers.
- Cleanup must remove generated proof rows.
- Cascading foreign keys are expected to clean child rows when generated `user_profiles` rows are deleted.
