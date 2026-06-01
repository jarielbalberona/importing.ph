CREATE TABLE "forwarder_quote_defaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"forwarder_company_id" uuid NOT NULL,
	"currency" text DEFAULT 'PHP' NOT NULL,
	"service_offered" text,
	"transit_min_days" integer,
	"transit_max_days" integer,
	"inclusions" text,
	"exclusions" text,
	"notes" text,
	"valid_for_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "contact_person" text;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "origin_cities" text;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "destination_areas" text;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "shipping_modes" text;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "service_description" text;--> statement-breakpoint
ALTER TABLE "importer_profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "importer_profiles" ADD COLUMN "contact_phone" text;--> statement-breakpoint
ALTER TABLE "forwarder_quote_defaults" ADD CONSTRAINT "forwarder_quote_defaults_forwarder_company_id_forwarder_companies_id_fk" FOREIGN KEY ("forwarder_company_id") REFERENCES "public"."forwarder_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "forwarder_quote_defaults_company_id_idx" ON "forwarder_quote_defaults" USING btree ("forwarder_company_id");