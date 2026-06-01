ALTER TABLE "forwarder_companies" ADD COLUMN "is_suspended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "suspended_reason" text;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD COLUMN "suspended_by_user_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "forwarder_companies" ADD CONSTRAINT "forwarder_companies_suspended_by_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("suspended_by_user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;