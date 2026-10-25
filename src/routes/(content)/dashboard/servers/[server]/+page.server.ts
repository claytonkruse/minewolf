import type { PageServerLoad } from "./$types";
import { temp_url } from "$lib/utils/redirect_urls";
import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db/drizzle/db";
import { eq } from "drizzle-orm";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { ANALYTICS_DAYS, getServerAnalytics } from "$lib/server/analytics";

export const load = (async ({ locals, params, url }) => {
    const { user } = locals;
    if (!user) redirect(303, temp_url("/login/", url.href));

    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
    });
    if (!server) error(404, "Server does not exist.");
    if (server.userId !== user.id)
        error(403, "You are not authorized to manage this server.");

    const analytics = await getServerAnalytics(server.id);

    return { server, analytics, analyticsDays: ANALYTICS_DAYS };
}) satisfies PageServerLoad;
