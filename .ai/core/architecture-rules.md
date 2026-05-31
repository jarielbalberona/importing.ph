# Architecture Rules

Replace these generic rules with repository-specific boundaries.

- Name the canonical backend, frontend, shared package, infrastructure, and test locations.
- Keep shared contracts in shared contract packages or documented API schemas.
- Do not add database, queue, cache, cloud, or vendor dependencies without an explicit initiative requirement.
- Keep handlers/controllers thin when the codebase has service boundaries.
- Prefer targeted tests around contract boundaries and critical business rules.
- Preserve unrelated dirty worktree changes.
- Keep edits scoped to the active initiative phase.

When architecture and speed conflict, choose the simplest design that keeps the next likely change cheap.
