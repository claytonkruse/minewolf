import { error } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "$lib/server/db/drizzle/db";
import { forumThreadTable } from "$lib/server/db/drizzle/schema";
import { isBot } from "$lib/server/bots";
import type { RequestHandler } from "./$types";

const ThreadViewSchema = z.object({
    threadId: z.number().int().positive(),
});

export const POST: RequestHandler = async ({ request }) => {
    const parsed = ThreadViewSchema.safeParse(
        await request.json().catch(() => null),
    );
    if (!parsed.success) error(400, "Invalid view payload.");

    if (!isBot(request)) {
        await db
            .update(forumThreadTable)
            .set({ views: sql`${forumThreadTable.views} + 1` })
            .where(eq(forumThreadTable.id, parsed.data.threadId))
            .catch(() => error(500, "Database error."));
    }
    return new Response(null, { status: 204 });
};
