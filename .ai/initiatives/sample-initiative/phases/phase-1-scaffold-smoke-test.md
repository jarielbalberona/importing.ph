# Phase 1: Scaffold Smoke Test

Status: pending

## Goal

Prove the installed runner can validate this sample initiative.

## Scope

- `.ai/initiatives/sample-initiative/**`
- `tools/ai-runner/**`

## Out Of Scope

- Application code.
- Database, vector, or indexing work.

## Inputs

- Installed scaffold files.

## Tasks

- Run check-only validation.
- Run runner tests.

## Verification Commands

- `node tools/ai-runner/index.mjs sample-initiative --check-only`
- `node --test tools/ai-runner/index.test.mjs`

## Expected Evidence

- Both commands exit `0`.

## Repair Policy

Allowed repairs:

- runner syntax errors
- missing scaffold files
- test fixture drift

Hard-stop for product, UX, auth, privacy, security, or destructive data decisions.
