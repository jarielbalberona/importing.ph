# Agent Guardrails

Status: baseline / to be confirmed

Source: current repo inspection.

## Core Boundaries

- PostgreSQL is the business-data source of truth. Clerk is for authentication, not primary business state.
- Preserve importer/forwarder privacy boundaries. Competitor quote details must not leak across forwarders.
- Do not broaden the product into a logistics ERP, warehouse system, or general operations platform without explicit direction.
- Keep marketplace messaging quote-gated unless durable project truth changes.
- Treat PSGC location data as database-backed operational data, not frontend-seeded truth.
- Treat attachment storage as private object-storage flow. Do not replace authorization checks with public URL assumptions.
- Admin safety actions that suspend forwarder companies are sensitive workflow changes and require proof beyond typecheck.

## Engineering Guardrails

- Do not create random markdown or revive project-local `.ai/`, `.agent/`, `.codex/`, `initiatives/`, `reports/`, or similar task folders.
- Do not bypass existing role/relationship checks for convenience.
- Do not silently broaden scope from a bug into a workflow rewrite.
- If `project-canon/`, code, runtime evidence, and old docs disagree, surface the conflict instead of guessing.
- No fake PASS. If runtime, auth, storage, or deploy proof is missing, say so directly.

## Verification Rule

Appropriate verification is default.

E2E is escalation, not default.

Use the narrowest reliable proof based on failure boundary and risk.

Do not stop at typecheck for behavioral issues.
