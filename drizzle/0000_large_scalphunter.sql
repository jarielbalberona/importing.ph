CREATE TYPE "public"."user_role" AS ENUM('importer', 'forwarder', 'admin');--> statement-breakpoint
CREATE TABLE "forwarder_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forwarder_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"forwarder_company_id" uuid NOT NULL,
	"member_role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "importer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"role" "user_role" NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forwarder_members" ADD CONSTRAINT "forwarder_members_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forwarder_members" ADD CONSTRAINT "forwarder_members_forwarder_company_id_forwarder_companies_id_fk" FOREIGN KEY ("forwarder_company_id") REFERENCES "public"."forwarder_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "importer_profiles" ADD CONSTRAINT "importer_profiles_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "forwarder_members_user_profile_id_idx" ON "forwarder_members" USING btree ("user_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "importer_profiles_user_profile_id_idx" ON "importer_profiles" USING btree ("user_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_clerk_user_id_idx" ON "user_profiles" USING btree ("clerk_user_id");