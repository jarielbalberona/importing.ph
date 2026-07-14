DO $$
BEGIN
  IF EXISTS (
    SELECT shipment_request_id
    FROM quotes
    WHERE status::text = 'accepted'
    GROUP BY shipment_request_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate accepted quotes exist. Stop and resolve them before applying 0020.';
  END IF;
END $$;
--> statement-breakpoint
CREATE FUNCTION "quote_status_is_accepted"("value" quote_status)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
AS $$ SELECT "value"::text = 'accepted' $$;
--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_one_accepted_per_request_idx"
  ON "quotes" USING btree ("shipment_request_id")
  WHERE quote_status_is_accepted("status");
--> statement-breakpoint
CREATE TABLE "rate_limit_states" (
  "scope" text NOT NULL,
  "subject_hash" text NOT NULL,
  "window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "request_count" integer DEFAULT 1 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "rate_limit_states_scope_subject_pk" PRIMARY KEY("scope", "subject_hash"),
  CONSTRAINT "rate_limit_states_request_count_positive" CHECK ("request_count" > 0)
);
--> statement-breakpoint
CREATE INDEX "rate_limit_states_updated_at_idx" ON "rate_limit_states" USING btree ("updated_at");
