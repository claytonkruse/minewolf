import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ params }) => {
    const serverId = Number(params.server);
    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, serverId),
    });

    return { server };
};
