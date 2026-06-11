# Verification Profile

Default verdicts:

- PASS
- PASS WITH ISSUES
- FAIL
- BLOCKED

## Verification Selection Rule

E2E is not the default verification mode.

Choose verification based on the failure boundary, affected surface, and risk level.

Use the narrowest reliable proof that would catch the bug if it regressed.

Preferred escalation order:

1. Static checks - typecheck, lint, import/build sanity
2. Unit tests - pure logic, validators, payload builders, state transitions
3. Component tests - UI state, rendering, form behavior
4. Integration/API tests - route/service/database/auth/role behavior
5. Local runtime/browser verification - user-facing behavior, routing, cache, auth flow
6. E2E tests - full critical journeys spanning frontend, backend, auth, database, and routing
7. Runtime/deploy proof - Render environment, PostgreSQL, PSGC import, R2, realtime socket behavior

Escalate to E2E only when:

- the issue spans multiple layers
- the full user journey itself is the required proof
- a critical quote, auth, privacy, or marketplace flow needs regression coverage
- lower-level tests cannot prove the fix

Do not use E2E by default for isolated validators, payload shaping, component rendering, styling, copy, or narrow API bugs.

Do not stop at typecheck when the issue is behavioral.

## Verification Decision Examples

| Issue type | Minimum expected proof | E2E default? |
|---|---|---|
| Pure validator or formatter bug | unit test + typecheck | No |
| Quote payload validation issue | unit test + relevant request/quote validation proof | No |
| Role redirect or authz bug | targeted auth/route proof + browser check when user-facing | No |
| Shipment request UI regression | component or browser proof | No |
| Importer cannot see updated request state | API/DB proof + local browser verification | Maybe |
| Full quote-to-conversation regression | browser flow or E2E when cross-layer proof is required | Maybe |
| Quote privacy leakage | auth/integration/DB proof | E2E optional, not sufficient alone |
| PSGC destination lookup failure | import/API/database proof | No |
| Attachment privacy/storage behavior | payload/storage/auth proof and runtime proof if claimed | No |
| Render deployment/runtime claim | environment/runtime proof against target deploy | No local E2E substitute |

## Task-Type Expectations

### Web UI changes

Required:

- relevant static checks
- component or browser verification for behavioral changes

### API / auth / server-action changes

Required:

- targeted unit or integration proof
- role/privacy checks when auth boundaries move

### Database / schema / ownership changes

Required:

- migration/schema proof
- ownership/privacy proof where applicable
- no claim of deploy safety without environment-aware verification

### Realtime messaging / notification changes

Required:

- message/read-state logic proof
- browser/runtime verification when user-visible unread state changes
- websocket/runtime proof when transport behavior is the actual seam

### PSGC / destination data changes

Required:

- import or lookup proof
- DB-backed verification for codes/rows when behavior depends on normalized data
- target-environment proof before claiming Render readiness for location-dependent flows

### Attachment / storage changes

Required:

- file validation proof
- storage/auth proof
- no claim of private download correctness without runtime authorization proof

### Auth switching or multi-role browser smoke

Required:

- separate browser contexts or private windows by default
- if a shared window is reused, explicit Clerk storage reset proof
- no claim that single-session role switching is reliable without runtime evidence

### Documentation / canon-only changes

Required:

- reference sweep
- canon consistency check
- no fake runtime claims
