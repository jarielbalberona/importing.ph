CREATE TYPE "public"."quote_status" AS ENUM('submitted', 'withdrawn');--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_request_id" uuid NOT NULL,
	"forwarder_company_id" uuid NOT NULL,
	"submitted_by_forwarder_member_id" uuid NOT NULL,
	"status" "quote_status" DEFAULT 'submitted' NOT NULL,
	"quote_amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'PHP' NOT NULL,
	"service_offered" text NOT NULL,
	"estimated_transit_min_days" integer NOT NULL,
	"estimated_transit_max_days" integer NOT NULL,
	"inclusions" text NOT NULL,
	"exclusions" text NOT NULL,
	"notes" text,
	"valid_until" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_shipment_request_id_shipment_requests_id_fk" FOREIGN KEY ("shipment_request_id") REFERENCES "public"."shipment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_forwarder_company_id_forwarder_companies_id_fk" FOREIGN KEY ("forwarder_company_id") REFERENCES "public"."forwarder_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_submitted_by_forwarder_member_id_forwarder_members_id_fk" FOREIGN KEY ("submitted_by_forwarder_member_id") REFERENCES "public"."forwarder_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_request_company_idx" ON "quotes" USING btree ("shipment_request_id","forwarder_company_id");--> statement-breakpoint
CREATE INDEX "quotes_shipment_request_id_idx" ON "quotes" USING btree ("shipment_request_id");--> statement-breakpoint
CREATE INDEX "quotes_forwarder_company_id_idx" ON "quotes" USING btree ("forwarder_company_id");--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status");