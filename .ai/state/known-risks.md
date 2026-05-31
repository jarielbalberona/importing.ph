# Known Risks

Risk lifecycle labels:

- `active`: unresolved and must be considered before related execution.
- `accepted`: known and intentionally tolerated for now with an explicit reason.
- `resolved`: no longer open because later work fixed or verified it.
- `superseded`: replaced by a later rule, initiative, or implementation boundary.

- active: Autonomous execution can amplify vague specifications. Every phase must define scope, verification, and hard stops clearly.
- active: The runner can invoke Codex, but it cannot guarantee good judgment. Skills and phase files must constrain behavior.
- active: Generated reports are useful only if verification evidence is concrete. Avoid optimistic summaries without command output.
- active: Repo state may contain unrelated dirty changes. Agents must inspect and preserve them.
- active: Product areas involving safety, verification, authentication, privacy, billing, destructive data changes, or security require conservative hard-stop behavior.
- resolved: `local-db-migration-proof` Phase 2 proved live Drizzle migration and schema check commands against `localhost:55432/importing_ph_dev`.
- resolved: `local-db-migration-proof` Phase 3 proved `db:smoke`, `db:prove-onboarding`, and generated proof user cleanup against `localhost:55432/importing_ph_dev`.
- resolved: `local-db-migration-proof` Phase 4 ran the final full verification sequence and wrote `reports/final-report.md`.
- accepted: `local-db-migration-proof` Phase 4 had one transient `npm run type-check` failure caused by running it in parallel with `npm run build` while `.next/types` was being regenerated. Sequential rerun passed.
- active: The Codex execution shell did not find `npm` on its default PATH during `local-db-migration-proof` Phase 1. Later phases should use `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH` or otherwise ensure `npm` is available before running `npm run db:*`.
- active: Local `.env` exists with environment values. Reports and command output must avoid exposing secrets; database target may be summarized as `localhost:55432/importing_ph_dev`.
- resolved: `auth-onboarding-roles` Phase 2 added importer retry/idempotency proof to `scripts/prove-onboarding.ts`.
- resolved: `auth-onboarding-roles` Phase 3 added forwarder retry/idempotency proof to `scripts/prove-onboarding.ts`.
- accepted: Local Docker/Postgres may need to be started before DB proof commands; this is safe when Compose config confirms the local `importing-ph-postgres` service on port `55432`.
- accepted: `auth-onboarding-roles` Phase 1 confirmed wrong-role access currently redirects to the user's own role destination instead of rendering `/unauthorized`; do not change without a product/UX decision.
- accepted: `auth-onboarding-roles` Phase 1 confirmed admin provisioning is not implemented; do not invent it in onboarding work.
- active: `auth-onboarding-roles` Phase 5 is blocked on complete browser smoke. The in-app browser has an existing Clerk session with no PostgreSQL profile, but there is no confirmed disposable Clerk test account or isolated auth smoke database target for mutating onboarding submissions.
- active: Do not submit onboarding in the development database for browser smoke unless the active Clerk account is confirmed disposable and cleanup expectations are explicit.
