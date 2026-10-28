CREATE TABLE "server_uptime" (
	"server_id" integer NOT NULL,
	"day" date NOT NULL,
	"pings" integer DEFAULT 0 NOT NULL,
	"online_pings" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "server_uptime_server_id_day_pk" PRIMARY KEY("server_id","day")
);
--> statement-breakpoint
ALTER TABLE "server_uptime" ADD CONSTRAINT "server_uptime_server_id_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."server"("id") ON DELETE cascade ON UPDATE no action;