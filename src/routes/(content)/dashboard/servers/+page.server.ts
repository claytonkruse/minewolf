import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { temp_url } from "$lib/utils/redirect_urls";

export const load = (async ({ locals }) => {
    const { user } = locals;
    if (!user) redirect(303, temp_url("/login/", "/dashboard/servers/"));
    const user_servers = await db
        .select()
        .from(serverTable)
        .where(eq(serverTable.userId, user.id));

    return { servers: user_servers };
}) satisfies PageServerLoad;
