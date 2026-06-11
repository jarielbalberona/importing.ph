# Deployment

Status: baseline / partially confirmed

Source: current repo inspection and bounded migrated reference from legacy root docs.

Current deploy truth in repo:

- hosting target is Render
- build command: `npm ci && npm run build`
- start command: `npm run start`
- database is provisioned through `render.yaml`

Current explicit non-claim:

- `render.yaml` does not prove that migrations, PSGC import, or storage setup are fully automated at deploy time

Migrated reference note:

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- operators may need to run `npm run db:migrate` and a PSGC import separately for the target environment before location-dependent flows are usable
- `render.yaml` should not be treated as proof that PSGC import or private storage setup is automated during deploy
