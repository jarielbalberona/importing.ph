# Architecture Rules

## Observed Architecture

This repository is a single Next.js App Router application.

Observed stack:

- Next.js `16.2.6`.
- React `19.2.4`.
- TypeScript with `strict: true`.
- Tailwind CSS v4.
- shadcn/ui-style components configured in `components.json`.
- Clerk for authentication.
- PostgreSQL via `postgres` client and Drizzle ORM.
- Drizzle Kit migrations under `drizzle/`.
- Render deployment via `render.yaml`.
- Local PostgreSQL via `docker-compose.yml`.

There is no separate backend service, API gateway, workspace package, queue worker, cache service, or monorepo structure in the current repo.

## Ownership Boundaries

- `app/`: App Router pages, route-level auth boundaries, server actions.
- `lib/authz.ts`: current server-side profile lookup and role gating.
- `lib/onboarding.ts`: onboarding validation and profile/company creation.
- `lib/routes.ts`: role-to-route mapping.
- `db/schema.ts`: canonical Drizzle schema definitions.
- `db/index.ts`: database client construction and cleanup.
- `drizzle/`: generated SQL migrations and metadata.
- `components/ui/`: local shadcn-style primitives.
- `scripts/`: local database proof scripts.
- `tools/ai-runner/`: local AI initiative execution tooling.
- `.ai/`: markdown memory, initiatives, templates, and state.

## Source Of Truth

Observed rule: Clerk authenticates users, but PostgreSQL stores application role and business profile state.

Evidence:

- `user_profiles.clerk_user_id` links Clerk identity to application profile.
- `user_profiles.role` stores `importer`, `forwarder`, or `admin`.
- `importer_profiles`, `forwarder_companies`, and `forwarder_members` store business context.
- Route authorization reads PostgreSQL through `requireProfile()` and `requireRole()`.

Do not move business state into Clerk metadata without an explicit product and architecture decision.

## API / UI Separation

No API route handlers are currently implemented.

Current write path:

- `/onboarding` renders a form.
- `app/onboarding/actions.ts` runs a server action.
- `lib/onboarding.ts` validates input and writes database rows inside a transaction.

Future marketplace writes can use server actions or route handlers, but the choice must be deliberate and documented in the initiative.

## Data Rules

- Drizzle schema files are the application-level source for database structure.
- SQL migrations live under `drizzle/`.
- Do not edit generated migration metadata casually.
- Any schema change requires a migration and verification plan.
- Do not introduce generic JSON-blob models for core marketplace entities unless a specific product requirement proves they are necessary.

## Execution Constraints For Future Agents

- Keep V1 monolithic.
- Do not add Express, NestJS, Prisma, Redis, queues, WebSockets, event buses, Terraform, ECS, or microservices unless explicitly authorized.
- Do not add React Query or Zustand by default; server-rendered and server-action flows are enough until the product proves otherwise.
- Keep code changes scoped to the active initiative phase.
- Preserve unrelated dirty worktree changes.
- For auth, privacy, quote visibility, destructive migrations, or unclear business rules, hard-stop and ask for a decision.
- Do not claim marketplace behavior exists unless repository code and verification prove it.

## Verify Before Implementation

Before implementing marketplace features, verify:

- Current database schema and migration state.
- Clerk environment variables and redirect behavior.
- Role-gated access paths for importer, forwarder, and admin.
- Whether request, quote, conversation, and message tables already exist.
- Whether the initiative defines visibility rules for importer-owned data and forwarder-owned quotes.
- Required verification commands for the phase.
