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
- verify R2 bucket credentials, upload compensation, relationship authorization, and authenticated forced-download behavior if attachments are enabled
- keep R2 direct-upload CORS restricted to `https://importing.ph` and retain the one-day lifecycle rule for `temporary/conversation-message-attachments/`
- run the temporary-upload cleanup command in dry-run mode before any confirmed cleanup: `npm run media:cleanup-temporary`; deletion requires `-- --confirm`
- run the V1 marketplace smoke against the target-like local or staging database
- run browser proof with separate importer and forwarder sessions for request creation, competing quote submission, automatic loser rejection, quote-gated conversation, message send, forced attachment download, and unread/read updates
- confirm database backup/restore ownership before public launch

Migrated reference note:

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- operators may need to run `npm run db:migrate` and a PSGC import separately for the target environment before location-dependent flows are usable
- `render.yaml` should not be treated as proof that PSGC import or private storage setup is automated during deploy
