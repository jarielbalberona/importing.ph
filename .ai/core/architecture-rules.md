# Architecture Rules

## Observed Architecture

This repository is a single deployable Next.js App Router application.

Observed stack:

- Next.js `16.2.6`.
- React `19.2.4`.
- TypeScript with `strict: true`.
- Tailwind CSS v4.
- shadcn-style UI primitives configured in `components.json`.
- Clerk for authentication.
- PostgreSQL via `postgres` client and Drizzle ORM.
- Drizzle Kit migrations under `drizzle/`.
- npm and `package-lock.json`.
- Local PostgreSQL through Docker Compose on host port `55432`.
- Render-oriented deployment config in `render.yaml`.

There is no separate backend service, API gateway, worker service, queue, cache service, monorepo workspace, or microservice boundary.

## Ownership Boundaries

- `app/`: App Router pages, route-level auth boundaries, and server actions.
- `app/app/requests/**`: importer request and importer messaging surfaces.
- `app/app/forwarder/requests/**`: forwarder request browse/detail and quote submission surfaces.
- `app/app/requests/messages/**`: importer conversation routes.
- `app/app/forwarder/messages/**`: forwarder conversation routes.
- `app/app/notifications/**`: in-app notification list/read actions.
- `app/admin/**`: admin read views and forwarder suspension actions.
- `lib/authz.ts`: current server-side profile lookup and role gating.
- `lib/onboarding.ts`: onboarding validation and profile/company creation.
- `lib/shipment-requests.ts`: importer request creation/list/detail helpers.
- `lib/forwarder-open-requests.ts`: forwarder membership guard and forwarder-safe request DTOs.
- `lib/quotes.ts`: quote submission, visibility, comparison, and decision helpers.
- `lib/messages.ts`: quote-gated conversation and message helpers.
- `lib/notifications.ts`: DB notification creation/list/read helpers.
- `lib/admin.ts`: admin overview and suspension helpers.
- `lib/routes.ts`: role-to-route mapping.
- `db/schema.ts`: canonical Drizzle schema definitions.
- `db/index.ts`: database client construction and cleanup.
- `drizzle/`: generated SQL migrations and metadata.
- `components/ui/`: local shadcn-style primitives.
- `scripts/`: local database proof scripts.
- `tools/ai-runner/`: local AI initiative execution tooling.
- `.ai/`: markdown memory, initiatives, templates, and state.

## Source Of Truth

Clerk authenticates users only. PostgreSQL owns business role and profile state.

Evidence:

- `user_profiles.clerk_user_id` links Clerk identity to application profile.
- `user_profiles.role` stores `importer`, `forwarder`, or `admin`.
- `importer_profiles`, `forwarder_companies`, and `forwarder_members` store business context.
- Route authorization reads PostgreSQL through `requireProfile()` and `requireRole()`.

Do not store business role/profile truth in Clerk metadata as the source of truth.

## Data Ownership Rules

- Drizzle schema in `db/schema.ts` owns application-level database structure.
- SQL migrations under `drizzle/` own migration history.
- Importers own `shipment_requests` through `importer_profile_id`.
- Forwarder companies own quotes through `forwarder_company_id`.
- Conversations are scoped by one shipment request plus one forwarder company.
- Notifications are scoped by `recipient_user_profile_id`.
- Admin suspension is currently company-level on `forwarder_companies`.

Any schema change requires migration generation/application and DB verification against the confirmed local target unless the active phase explicitly says otherwise.

## Local Database Rules

Confirmed local development database:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Docker Compose service:

- Container: `importing-ph-postgres`.
- Host port: `55432`.
- Container port: `5432`.
- Database: `importing_ph_dev`.
- User: `importing_ph`.

Do not assume port `5432` on the host.

Never run destructive reset/drop/truncate commands unless a phase explicitly permits exact local fixture cleanup and the target is confirmed local.

## Non-Negotiables

- Keep V1 monolithic.
- Use Next.js App Router, TypeScript, Tailwind CSS v4, PostgreSQL, Drizzle, Clerk, and npm.
- Use server-side guards for role, ownership, quote visibility, and messaging access.
- Preserve quote privacy: competitor forwarders must not see private quote details.
- Preserve messaging gate: no quote means no messaging.
- Preserve admin boundary: ordinary onboarding must not create admins.

Do not introduce unless explicitly approved:

- Prisma.
- Express or NestJS.
- AWS/ECS/Terraform.
- Redis.
- Queues or event buses.
- WebSockets/realtime infrastructure.
- Microservices or separate backend services.
- Package-manager migration.
- React Query or Zustand by default.

## Render Deployment Truth

`render.yaml` currently defines:

- One web service: `importing-ph`.
- Build: `npm ci && npm run build`.
- Start: `npm run start`.
- Node version: `22`.
- Managed PostgreSQL database: `importing-ph-db`.
- Required Clerk env vars.
- `DATABASE_URL` from Render database connection string.

Do not claim production readiness until production env vars, admin seed, migration target, and non-destructive production smoke are executed.

## Hard Stops For Future Agents

Stop before implementing if any of these are unclear:

- Auth or role boundary.
- Quote visibility boundary.
- Messaging participant boundary.
- Destructive migration or database target.
- Admin provisioning or suspension semantics.
- Product scope that expands into payments, tracking, ERP, SEO, moderation, or realtime.

Do not claim marketplace behavior exists unless code and verification prove it.
