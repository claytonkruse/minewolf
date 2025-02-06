import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/drizzle/db";
import { serverTable } from "$lib/server/drizzle/schema";

export const load: PageServerLoad = async ({ url }) => {
    const page = Math.floor(Number(url.searchParams.get("p"))) || 1;
    const servers = await db.query.serverTable.findMany();
    return { servers, page };
};
