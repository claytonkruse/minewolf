CREATE TYPE "public"."view_kind" AS ENUM('listing', 'page');--> statement-breakpoint
CREATE TABLE "server_view" (
	"server_id" integer NOT NULL,
	"kind" "view_kind" NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "server_view_server_id_kind_day_pk" PRIMARY KEY("server_id","kind","day")
);
--> statement-breakpoint
ALTER TABLE "server_view" ADD CONSTRAINT "server_view_server_id_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE cascade ON UPDATE no action;