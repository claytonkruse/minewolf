import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { searchServers } from "$lib/server/searchServers";

export const load: PageServerLoad = async ({ url }) => {
    const page = Math.floor(Number(url.searchParams.get("p"))) || 1;
    const name = url.searchParams.get("name")?.trim() || null;
    const tag = url.searchParams.get("tag")?.trim() || null;
    let servers = name
        ? await searchServers(name)
        : await db.select().from(serverTable);
    if (tag) {
        const wanted = tag.toLowerCase();
        servers = servers.filter((server) =>
            server.tags
                .split(",")
                .some((t) => t.trim().toLowerCase() === wanted),
        );
    }
    return { servers, page, tag };
};
