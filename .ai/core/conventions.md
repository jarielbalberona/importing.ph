# Conventions

## Package Manager And Commands

Observed package manager: `npm`.

Evidence:

- `package-lock.json` exists.
- `package.json` scripts use plain npm-compatible commands.
- No `pnpm-workspace.yaml` was found.

Common commands:

- Install: `npm install` or `npm ci` for clean install.
- Dev: `npm run dev`.
- Build: `npm run build`.
- Start: `npm run start`.
- Lint: `npm run lint`.
- Type-check: `npm run type-check`.
- Drizzle generate: `npm run db:generate`.
- Drizzle migrate: `npm run db:migrate`.
- Drizzle push: `npm run db:push`.
- Drizzle check: `npm run db:check`.
- Drizzle studio: `npm run db:studio`.
- DB smoke: `npm run db:smoke`.
- Onboarding proof: `npm run db:prove-onboarding`.
- AI runner: `npm run ai:run -- <initiative-key>`.
- AI runner test: `npm run test:ai-runner`.

There is no general `npm test` script currently.

## Verification Expectations

For application code changes, use the relevant initiative verification plan. The baseline commands currently available are:

```bash
npm run type-check
npm run lint
npm run build
```

For database/onboarding work, useful current commands are:

```bash
npm run db:migrate
npm run db:check
npm run db:smoke
npm run db:prove-onboarding
```

For this memory alignment task only, do not run application tests or builds. Verify file scope and markdown readability instead.

## Coding Conventions

Observed conventions:

- TypeScript is strict.
- Imports use the `@/*` path alias.
- App Router pages live under `app/`.
- Server actions are used for onboarding writes.
- Server-side route gates call helpers from `lib/authz.ts`.
- Shared role routing lives in `lib/routes.ts`.
- Database schema lives in `db/schema.ts`.
- Database connection logic lives in `db/index.ts`.
- UI primitives live in `components/ui/`.
- Styling uses Tailwind CSS v4 with CSS variables in `app/globals.css`.
- shadcn/ui config uses `new-york`, neutral base color, RSC, TSX, and lucide icons.
- ESLint uses `eslint-config-next` core web vitals and TypeScript config.

## Repository Structure

Observed top-level structure:

- `app/`: Next.js routes.
- `components/`: UI components.
- `db/`: Drizzle schema and client.
- `drizzle/`: migrations and Drizzle metadata.
- `lib/`: app-level helpers and business logic.
- `scripts/`: local verification/proof scripts.
- `tools/ai-runner/`: initiative runner.
- `.ai/`: memory, state, templates, initiatives.
- `.agent/skills/`: repo-local agent skills.

## AI Initiative Execution

- Use `.agent/skills/project-memory-execution/SKILL.md` when executing a locked initiative phase.
- Do not create initiatives unless explicitly asked.
- Do not edit `.ai/core/*` during ordinary phase execution unless the user explicitly asks.
- Keep phase execution scoped to one phase.
- Preserve unrelated dirty worktree changes.
- Phase reports must include exact verification outcomes.
- State files must be updated by execution phases, not by this core memory alignment unless explicitly required.

## Unknown / Gaps

- No formatter script is declared.
- No general application test script is declared.
- No API route convention exists yet.
- No marketplace module folder structure exists yet.
- No request/quote/conversation test pattern exists yet.
