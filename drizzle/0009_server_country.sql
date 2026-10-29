ALTER TABLE "server" ADD COLUMN "country" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "server" ADD COLUMN "country_checked_at" timestamp with time zone;