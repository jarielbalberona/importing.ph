# Sample Initiative

## Initiative Key

`sample-initiative`

## Dependencies

depends_on: []

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: no
- Latest execution status: not started.

## Objective

Validate that the local AI memory scaffold is installed and the runner can preflight a minimal initiative.

## Scope

- `.ai/initiatives/sample-initiative/**`
- Runner check-only verification.

## Non-Goals

- No application code changes.
- No infrastructure changes.
- No database or vector index.

## Acceptance Criteria

- `node tools/ai-runner/index.mjs sample-initiative --check-only` passes.
- `node --test tools/ai-runner/index.test.mjs` passes.

## Domain Model

- Initiative: a repo-local plan that owns lifecycle metadata and phases.
- Phase: a numeric execution unit with one status.
- Report: durable evidence written after execution.

## Module Sequence

1. Validate installed memory files.
2. Validate runner behavior.

## Cross-Module Data Flow

No runtime data flow. This initiative is tooling-only.

## Verification Plan

- `node tools/ai-runner/index.mjs sample-initiative --check-only`
- `node --test tools/ai-runner/index.test.mjs`

## Hard Stops

- Stop if the runner cannot locate `.ai`.
- Stop if the project-specific core files have not been customized before real implementation work.
