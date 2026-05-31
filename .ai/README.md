# importing.ph AI Memory

This directory is the local source of truth for AI-assisted planning and execution inside this repository. It is markdown-first by design. Do not bolt on databases, embeddings, vector stores, dashboards, or cloud orchestration for V1.

## Memory Hierarchy

- `core/`: durable project context. Agents must read relevant files before planning or executing work. Do not edit these files automatically during phase execution.
- `state/`: operational project state. Phase execution must update `current-state.md`, `known-risks.md`, and `verification-status.md`. Update `decisions.md` only when a durable decision is made.
- `initiatives/`: one folder per initiative. Each initiative contains an overview, domain model, phase plan, data flow, verification plan, phase files, and reports.
- `templates/`: canonical templates for initiatives, phases, reports, and decisions.

## Initiative Lifecycle

1. A human writes a feature or technical objective.
2. The initiative authoring skill converts it into `.ai/initiatives/<initiative-key>/`.
3. The human reviews the plan at the initiative level.
4. The runner executes phases in numeric order.
5. Each phase writes a report and updates project state.
6. Completion produces `reports/final-report.md`.

## Initiative Dependencies

Initiatives may declare dependencies in `00-overview.md`:

```text
depends_on: other-initiative, another-initiative
```

Use `depends_on: []` when there are no dependencies.

The runner must not execute an initiative until every dependency exists, has valid required files and phase statuses, has all phases in terminal status, has no `blocked` or `failed` phase, and has `reports/final-report.md`.

## Phase Lifecycle

Canonical statuses:

- `pending`: not started.
- `in_progress`: currently executing.
- `repairing`: execution or verification failed and repair is being attempted.
- `passed`: verification passed with no known residual issue.
- `passed_with_issues`: phase passed but documented non-blocking risks remain.
- `blocked`: hard stop encountered; human decision required.
- `failed`: attempts exhausted or unrecoverable execution failure.

Do not use `completed` or `done`.

## Execution Lifecycle

The local runner must:

1. Run preflight validation before invoking Codex.
2. Confirm the initiative exists, is locked, and is ready for execution.
3. Confirm required initiative files, phases, reports folder, phase numbering, phase statuses, and dependencies are valid.
4. Load `.ai/core/*`, `.ai/state/*`, and the selected initiative.
5. Find the first phase with status `pending` by numeric phase order.
6. Execute only that phase.
7. Run that phase's verification commands.
8. Attempt bounded repair when verification fails.
9. Write a phase report.
10. Update state files.
11. Move to the next phase until completion or hard stop.

Use:

```bash
node tools/ai-runner/index.mjs <initiative-key> --check-only
```

## State Lifecycle

- Initiative `00-overview.md` owns durable lifecycle metadata.
- Phase files own per-phase status.
- Phase reports own execution evidence.
- `.ai/state/current-state.md` is the live cross-initiative summary.
- `.ai/state/verification-status.md` is the live verification summary.
- Runner-managed state sections must be keyed and replaced by heading when rerun.

## Risk Lifecycle

Every entry in `.ai/state/known-risks.md` must use one lifecycle label:

- `active`: unresolved and must be considered before related execution.
- `accepted`: known and intentionally tolerated for now with a reason.
- `resolved`: no longer open because later work fixed or verified it.
- `superseded`: replaced by a later rule, initiative, or implementation boundary.

## Report Quality

Every phase report must include exact command strings, verification summary, failure excerpts, skipped-command reasons, files changed, repair attempts, unrelated drift classification, state updates, decisions updates, and risks using lifecycle labels.

## Repair Lifecycle

Allowed self-repair categories:

- type-check failures
- lint failures
- build failures
- missing imports
- formatting issues
- generated file drift
- minor contract mismatches inside the active phase scope

Default repair limit is three attempts. Infinite loops are forbidden.

## Hard Stops

Stop immediately and mark the phase `blocked` for security, authentication, privacy, destructive migration, conflicting specification, required product/UX decision, required human validation, scope expansion, or repeated failure after max retries.

## Future V2 Architecture

V2 can consider richer indexing, cross-project memory, dashboards, or external orchestration only after V1 proves plain repository files, disciplined phase specs, and bounded execution are insufficient.
