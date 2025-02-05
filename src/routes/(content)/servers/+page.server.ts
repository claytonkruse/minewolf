import { db } from "$lib/server/drizzle/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const page = Math.floor(Number(url.searchParams.get("p"))) || 1;
    const servers = await db.query.servers.findMany();
    return { servers, page };
};
