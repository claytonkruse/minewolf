import { db } from "$lib/server/drizzle/db";
import { serverTable } from "$lib/server/drizzle/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { z } from "zod";

export const load: PageServerLoad = async ({ params, locals }) => {
    const parse = await z.coerce.number().int().safeParseAsync(params.id);
    if (!parse.success) error(422, "Invalid integer.");

    const server = (
        await db
            .select()
            .from(serverTable)
            .limit(1)
            .where(eq(serverTable.id, parse.data))
            .catch((e) => error(400, "Database error."))
    )[0];

    if (!server) error(404, "Listing not found.");

    const { user } = locals;
    return { server, user };
};
