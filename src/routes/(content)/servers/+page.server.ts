import type { PageServerLoad } from "./$types";
import { asc, sql } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { searchServers } from "$lib/server/searchServers";
import { pageParam } from "$lib/server/forum";

const SERVERS_PER_PAGE = 25;

export const load: PageServerLoad = async ({ url }) => {
    const page = pageParam(url);
    const name = url.searchParams.get("name")?.trim() || null;
    const tag = url.searchParams.get("tag")?.trim() || null;
    let servers = name
        ? await searchServers(name)
        : await db
              .select()
              .from(serverTable)
              // Rank 0 means unranked, so those go after ranked servers.
              .orderBy(
                  sql`${serverTable.rank} = 0`,
                  asc(serverTable.rank),
                  asc(serverTable.name),
              );
    if (tag) {
        const wanted = tag.toLowerCase();
        servers = servers.filter((server) =>
            server.tags
                .split(",")
                .some((t) => t.trim().toLowerCase() === wanted),
        );
    }
    return {
        servers: servers.slice(
            (page - 1) * SERVERS_PER_PAGE,
            page * SERVERS_PER_PAGE,
        ),
        page,
        pageCount: Math.max(1, Math.ceil(servers.length / SERVERS_PER_PAGE)),
        name,
        tag,
    };
};
