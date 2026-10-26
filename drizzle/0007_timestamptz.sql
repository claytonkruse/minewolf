ALTER TABLE "forum_post" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "forum_post" ALTER COLUMN "edited_at" SET DATA TYPE timestamp with time zone USING "edited_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "forum_thread" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "forum_thread" ALTER COLUMN "last_post_at" SET DATA TYPE timestamp with time zone USING "last_post_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "server" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "server" ALTER COLUMN "last_ping_at" SET DATA TYPE timestamp with time zone USING "last_ping_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "server" ALTER COLUMN "last_online_at" SET DATA TYPE timestamp with time zone USING "last_online_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "discord_access_token_expires_at" SET DATA TYPE timestamp with time zone USING "discord_access_token_expires_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_role" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "last_online_at" SET DATA TYPE timestamp with time zone USING "last_online_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "vote" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';