# Conventions

## Package Manager And Commands

Use `npm`.

Evidence:

- `package-lock.json` exists.
- `package.json` scripts use plain npm-compatible commands.
- No workspace package manager file is present.

Available scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run type-check`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:studio`
- `npm run db:check`
- `npm run db:smoke`
- `npm run db:prove-onboarding`
- `npm run ai:run -- <initiative-key>`
- `npm run test:ai-runner`

There is no general `npm test` script currently.

## Shell PATH Convention

In this Codex shell, npm may require:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
```

Use that prefix for verification commands unless the shell environment is fixed.

## Local Database Convention

Use this local development database target for non-destructive local verification:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume host port `5432`.

Docker Compose maps:

```text
localhost:55432 -> postgres container port 5432
```

For destructive or repeatable isolated smoke, use a dedicated local test database if the active initiative requires it. Do not run destructive reset/drop/truncate commands against the development database unless the phase explicitly permits exact fixture cleanup and confirms the target is local.

## Verification Expectations

For application code changes, run at minimum:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
```

For database/schema work, run as applicable:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:generate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check
```

For foundation/onboarding proof, use as applicable:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:smoke
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:prove-onboarding
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run test:ai-runner
```

Run `type-check` and `build` sequentially. Do not run them in parallel; concurrent `.next` generation has produced false `routes.js` type errors.

## Browser Smoke Conventions

- Use disposable Clerk test accounts only.
- Use email addresses ending in `+clerk_test@clerk.com`.
- Use Clerk test OTP `424242` when prompted.
- Never use personal or production emails for smoke tests.
- Clean up exact smoke DB rows by ID/prefix.
- Delete disposable Clerk users after smoke when they were created for the test.
- Do not claim browser proof unless the browser route/action was actually exercised.

## Coding Conventions

Observed conventions:

- TypeScript is strict.
- Imports use the `@/*` path alias.
- App Router pages live under `app/`.
- Server actions are used for writes.
- Server-side route gates call helpers from `lib/authz.ts`.
- Shared role routing lives in `lib/routes.ts`.
- Domain helpers live in `lib/`.
- Database schema lives in `db/schema.ts`.
- Database connection logic lives in `db/index.ts`.
- UI primitives live in `components/ui/`.
- Styling uses Tailwind CSS v4 with CSS variables in `app/globals.css`.
- shadcn-style config uses `new-york`, neutral base color, RSC, TSX, and lucide icons.
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

- Use `.agent/skills/project-memory-execution/SKILL.md` when executing a locked initiative phase. The user may refer to `.codex/skills/...`, but the repo-local path observed here is `.agent/skills/...`.
- Do not create initiatives unless explicitly asked.
- Do not edit `.ai/core/*` during ordinary phase execution unless the user explicitly asks.
- Keep phase execution scoped to one phase unless the user explicitly asks for autonomous continuation.
- Preserve unrelated dirty worktree changes.
- Phase reports must include exact verification outcomes.
- State files must be updated by execution phases.

## Current Gaps

- No formatter script is declared.
- No general application test script is declared.
- No production deployment runbook exists yet.
- No production admin seed script/process is documented in repo code.
- No email/Resend dependency or env wiring exists.
