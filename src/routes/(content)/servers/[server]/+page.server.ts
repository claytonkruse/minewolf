import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, locals }) => {
    const serverId = Number(params.server);

    const server = (
        await db
            .select()
            .from(serverTable)
            .limit(1)
            .where(eq(serverTable.id, serverId))
            .catch((e) => error(400, "Database error."))
    )[0];

    if (!server) error(404, "Server listing not found.");

    const { user } = locals;
    return { server, user };
};
