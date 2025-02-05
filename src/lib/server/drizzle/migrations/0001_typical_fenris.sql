ALTER TABLE "server" ADD COLUMN "votifier_address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "server" ADD COLUMN "votifier_port" integer DEFAULT 8192 NOT NULL;--> statement-breakpoint
ALTER TABLE "server" ADD COLUMN "votifier_key" text DEFAULT '' NOT NULL;