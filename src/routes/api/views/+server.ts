import { error } from "@sveltejs/kit";
import { z } from "zod";
import { recordViews } from "$lib/server/analytics";
import { viewKindEnum } from "$lib/server/db/drizzle/schema";
import { isBot } from "$lib/server/bots";
import type { RequestHandler } from "./$types";

const ViewsSchema = z.object({
    kind: z.enum(viewKindEnum.enumValues),
    serverIds: z.array(z.number().int().positive()).min(1).max(200),
});

export const POST: RequestHandler = async ({ request }) => {
    const parsed = ViewsSchema.safeParse(
        await request.json().catch(() => null),
    );
    if (!parsed.success) error(400, "Invalid view payload.");

    if (!isBot(request)) {
        const { kind, serverIds } = parsed.data;
        await recordViews([...new Set(serverIds)], kind).catch(() =>
            error(500, "Database error."),
        );
    }
    return new Response(null, { status: 204 });
};
