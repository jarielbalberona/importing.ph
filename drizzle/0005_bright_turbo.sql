CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_request_id" uuid NOT NULL,
	"importer_profile_id" uuid NOT NULL,
	"forwarder_company_id" uuid NOT NULL,
	"opened_by_quote_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_user_profile_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_shipment_request_id_shipment_requests_id_fk" FOREIGN KEY ("shipment_request_id") REFERENCES "public"."shipment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_importer_profile_id_importer_profiles_id_fk" FOREIGN KEY ("importer_profile_id") REFERENCES "public"."importer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_forwarder_company_id_forwarder_companies_id_fk" FOREIGN KEY ("forwarder_company_id") REFERENCES "public"."forwarder_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_opened_by_quote_id_quotes_id_fk" FOREIGN KEY ("opened_by_quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("sender_user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_request_forwarder_company_idx" ON "conversations" USING btree ("shipment_request_id","forwarder_company_id");--> statement-breakpoint
CREATE INDEX "conversations_importer_profile_id_idx" ON "conversations" USING btree ("importer_profile_id");--> statement-breakpoint
CREATE INDEX "conversations_forwarder_company_id_idx" ON "conversations" USING btree ("forwarder_company_id");--> statement-breakpoint
CREATE INDEX "conversations_shipment_request_id_idx" ON "conversations" USING btree ("shipment_request_id");--> statement-breakpoint
CREATE INDEX "conversations_opened_by_quote_id_idx" ON "conversations" USING btree ("opened_by_quote_id");--> statement-breakpoint
CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_at_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_sender_user_profile_id_idx" ON "messages" USING btree ("sender_user_profile_id");