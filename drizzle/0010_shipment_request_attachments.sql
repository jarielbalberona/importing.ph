CREATE TYPE "public"."media_file_context" AS ENUM('shipment_request_attachment');--> statement-breakpoint
CREATE TYPE "public"."media_file_status" AS ENUM('temporary', 'active', 'deleted', 'hidden');--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_profile_id" uuid NOT NULL,
	"importer_profile_id" uuid,
	"context" "media_file_context" NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"content_type" text NOT NULL,
	"detected_content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" text NOT NULL,
	"status" "media_file_status" DEFAULT 'temporary' NOT NULL,
	"attached_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "shipment_request_attachments" (
	"shipment_request_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_owner_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("owner_user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_importer_profile_id_importer_profiles_id_fk" FOREIGN KEY ("importer_profile_id") REFERENCES "public"."importer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_request_attachments" ADD CONSTRAINT "shipment_request_attachments_shipment_request_id_shipment_requests_id_fk" FOREIGN KEY ("shipment_request_id") REFERENCES "public"."shipment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_request_attachments" ADD CONSTRAINT "shipment_request_attachments_file_id_media_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media_files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_files_object_key_idx" ON "media_files" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "media_files_owner_context_status_idx" ON "media_files" USING btree ("owner_user_profile_id","context","status");--> statement-breakpoint
CREATE INDEX "media_files_importer_profile_id_idx" ON "media_files" USING btree ("importer_profile_id");--> statement-breakpoint
CREATE INDEX "media_files_status_created_at_idx" ON "media_files" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "shipment_request_attachments_request_file_idx" ON "shipment_request_attachments" USING btree ("shipment_request_id","file_id");--> statement-breakpoint
CREATE INDEX "shipment_request_attachments_file_id_idx" ON "shipment_request_attachments" USING btree ("file_id");
