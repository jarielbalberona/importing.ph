# Known Risks

Risk lifecycle labels:

- `active`: unresolved and must be considered before related execution.
- `accepted`: known and intentionally tolerated for now with an explicit reason.
- `resolved`: no longer open because later work fixed or verified it.
- `superseded`: replaced by a later rule, initiative, or implementation boundary.

- active: Autonomous execution can amplify vague specifications. Every phase must define scope, verification, and hard stops clearly.
- active: The runner can invoke Codex, but it cannot guarantee good judgment. Skills and phase files must constrain behavior.
- active: Generated reports are useful only if verification evidence is concrete. Avoid optimistic summaries without command output.
- active: Repo state may contain unrelated dirty changes. Agents must inspect and preserve them.
- active: Product areas involving safety, verification, authentication, privacy, billing, destructive data changes, or security require conservative hard-stop behavior.
