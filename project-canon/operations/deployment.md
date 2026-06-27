# Deployment

Status: baseline / partially confirmed

Source: current repo inspection and bounded migrated reference from legacy root docs.

Current deploy truth in repo:

- hosting target is Render
- build command: `npm ci && npm run build`
- start command: `npm run start`
- database is provisioned through `render.yaml`
- transactional email delivery uses Resend and requires `RESEND_API_KEY`, `EMAIL_FROM`, and verified sender/domain configuration in the target environment

Current explicit non-claim:

- `render.yaml` does not prove that migrations, PSGC import, or storage setup are fully automated at deploy time
- local template rendering does not prove production Resend deliverability

V1 launch checklist:

- run database migrations against the target database
- import PSGC data into the target database before destination lookup is used
- verify Clerk production URLs and redirect settings
- verify Resend sender/domain setup and one transactional email delivery smoke
- verify R2 bucket credentials and private attachment read URL behavior if attachments are enabled
- run the V1 marketplace smoke against the target-like local or staging database
- run browser proof with separate importer and forwarder sessions for request creation, quote submission, quote decision, quote-gated conversation, message send, and unread/read updates
- confirm database backup/restore ownership before public launch

Migrated reference note:

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- operators may need to run `npm run db:migrate` and a PSGC import separately for the target environment before location-dependent flows are usable
- `render.yaml` should not be treated as proof that PSGC import or private storage setup is automated during deploy
