# Project Canon

This directory is the curated authoritative source of truth for the project.

- Keep product, architecture, domain, operations, decisions, and changelog documentation here.
- Update `project-canon/` when durable project truth changes.
- Do not use `project-canon/` for temporary debugging notes, task reports, or scratch findings.
- `project-canon/` is not fully seeded yet. Early canon files may be baseline summaries that still need code/runtime confirmation.

## Status

Baseline seeded from current repo inspection and a small number of migrated legacy root-doc notes.

- Source: current repo inspection unless a file explicitly says it was migrated from legacy root docs.
- Validation status: baseline only, not a full architecture or runtime audit.

## Structure

- `product/` - product purpose, workflows, and user roles
- `architecture/` - bounded system structure and technical surfaces
- `domain/` - core entities, business rules, and permissions
- `operations/` - environments, deployment, troubleshooting, and verification expectations
- `decisions/` - durable ADR-level decisions when they exist
- `changelog/` - durable canon changes, not task history

## Canon Routing Index

- product/workflow: `product/overview.md`, `product/workflows.md`
- user roles/permissions: `product/user-roles.md`, `domain/permissions.md`
- domain/business rules: `domain/entities.md`, `domain/business-rules.md`
- frontend/UI: `architecture/frontend.md`
- backend/API: `architecture/backend.md`
- database/persistence: `architecture/database.md`, `domain/entities.md`
- integrations: `architecture/integrations.md`
- deployment/environments: `operations/environments.md`, `operations/deployment.md`
- troubleshooting/operations: `operations/troubleshooting.md`, `operations/agent-guardrails.md`
- verification/testing: `operations/verification-profile.md`
- security/privacy: `domain/permissions.md`, `operations/agent-guardrails.md`
- mobile/offline/device: not applicable; importing.ph is web-only in this repo
