// Search and filters for /servers/, shared with /servers/random so the random
// button picks from the same results the list shows.
import { asc, sql } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { searchServers } from "$lib/server/searchServers";
import { supportsRelease } from "$lib/server/versions";

export type ServerFilters = {
    name: string | null;
    tag: string | null;
    version: string | null;
    // ISO 3166-1 alpha-2 code, e.g. "US"
    country: string | null;
    // Offline servers are hidden unless asked for.
    offline: boolean;
    crossplay: boolean;
    open: boolean;
};

export function parseTags(tags: string) {
    return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

export function parseFilters(params: URLSearchParams): ServerFilters {
    return {
        name: params.get("name")?.trim() || null,
        tag: params.get("tag")?.trim() || null,
        version: params.get("version")?.trim() || null,
        country: params.get("country")?.trim().toUpperCase() || null,
        offline: params.get("offline") === "1",
        crossplay: params.get("crossplay") === "1",
        open: params.get("open") === "1",
    };
}

// Every matching server: by relevance for a text search, otherwise by rank.
export async function findServers(filters: ServerFilters) {
    const { name, tag, version, country, offline, crossplay, open } = filters;
    const matches = name
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

    const wantedTag = tag?.toLowerCase();
    return matches.filter(
        (server) =>
            (!wantedTag ||
                parseTags(server.tags).some(
                    (t) => t.toLowerCase() === wantedTag,
                )) &&
            (!version || supportsRelease(server.versionString, version)) &&
            (!country || server.country === country) &&
            (offline || server.online) &&
            (!crossplay || server.crossplay) &&
            (!open || !server.whitelisted),
    );
}
