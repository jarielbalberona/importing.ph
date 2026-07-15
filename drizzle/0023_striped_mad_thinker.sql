ALTER TYPE "public"."media_file_context" ADD VALUE 'conversation_message_attachment';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'quote_updated' BEFORE 'quote_accepted';--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"message_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"display_position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_attachments_message_file_pk" PRIMARY KEY("message_id","file_id"),
	CONSTRAINT "message_attachments_display_position_nonnegative" CHECK ("message_attachments"."display_position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "quote_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"edited_by_forwarder_member_id" uuid NOT NULL,
	"quote_amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"shipping_mode" "quote_shipping_mode" NOT NULL,
	"service_offered" text NOT NULL,
	"estimated_transit_min_days" integer NOT NULL,
	"estimated_transit_max_days" integer NOT NULL,
	"inclusions" text NOT NULL,
	"exclusions" text NOT NULL,
	"notes" text,
	"valid_until" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_revisions_revision_number_positive" CHECK ("quote_revisions"."revision_number" > 0)
);
--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "conversation_id" uuid;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "media_files" ALTER COLUMN "checksum_sha256" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_file_id_media_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media_files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_revisions" ADD CONSTRAINT "quote_revisions_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_revisions" ADD CONSTRAINT "quote_revisions_edited_by_forwarder_member_id_forwarder_members_id_fk" FOREIGN KEY ("edited_by_forwarder_member_id") REFERENCES "public"."forwarder_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quote_revisions_quote_revision_idx" ON "quote_revisions" USING btree ("quote_id","revision_number");--> statement-breakpoint
INSERT INTO "quote_revisions" (
	"quote_id",
	"revision_number",
	"edited_by_forwarder_member_id",
	"quote_amount",
	"currency",
	"shipping_mode",
	"service_offered",
	"estimated_transit_min_days",
	"estimated_transit_max_days",
	"inclusions",
	"exclusions",
	"notes",
	"valid_until",
	"created_at"
)
SELECT
	"id",
	1,
	"submitted_by_forwarder_member_id",
	"quote_amount",
	"currency",
	"shipping_mode",
	"service_offered",
	"estimated_transit_min_days",
	"estimated_transit_max_days",
	"inclusions",
	"exclusions",
	"notes",
	"valid_until",
	"created_at"
FROM "quotes"
ON CONFLICT ("quote_id", "revision_number") DO NOTHING;--> statement-breakpoint
CREATE UNIQUE INDEX "message_attachments_message_position_idx" ON "message_attachments" USING btree ("message_id","display_position");--> statement-breakpoint
CREATE UNIQUE INDEX "message_attachments_file_id_idx" ON "message_attachments" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "quote_revisions_quote_created_at_idx" ON "quote_revisions" USING btree ("quote_id","created_at");--> statement-breakpoint
CREATE INDEX "media_files_conversation_id_idx" ON "media_files" USING btree ("conversation_id");
