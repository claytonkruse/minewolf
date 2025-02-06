CREATE TABLE "vote" (
	"id" text PRIMARY KEY NOT NULL,
	"server_id" integer NOT NULL,
	"ip" text NOT NULL,
	"minecraft_username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vote_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_server_id_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE cascade ON UPDATE no action;