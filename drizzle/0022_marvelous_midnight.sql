CREATE TABLE "funnel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"event_name" text NOT NULL,
	"user_profile_id" uuid,
	"role" "user_role",
	"auth_intent" text,
	"entity_type" text,
	"entity_id" uuid,
	"dedupe_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "funnel_events_event_name_check" CHECK ("funnel_events"."event_name" in ('auth_started', 'onboarding_completed', 'request_started', 'request_posted', 'forwarder_profile_ready', 'quote_started', 'quote_submitted', 'quote_received', 'quote_accepted', 'first_message_sent'))
);
--> statement-breakpoint
ALTER TABLE "funnel_events" ADD CONSTRAINT "funnel_events_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "funnel_events_dedupe_key_idx" ON "funnel_events" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "funnel_events_event_created_at_idx" ON "funnel_events" USING btree ("event_name","created_at");--> statement-breakpoint
CREATE INDEX "funnel_events_journey_id_idx" ON "funnel_events" USING btree ("journey_id");--> statement-breakpoint
CREATE INDEX "funnel_events_user_profile_id_idx" ON "funnel_events" USING btree ("user_profile_id");--> statement-breakpoint
CREATE INDEX "funnel_events_created_at_idx" ON "funnel_events" USING btree ("created_at");
