import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { pageParam } from "$lib/server/forum";
import { getUptimes } from "$lib/server/analytics";
import { SORTS, type Sort } from "$lib/serverSearch";
import { releaseOptions } from "$lib/server/versions";
import {
    findServers,
    parseFilters,
    parseTags,
} from "$lib/server/serverFilters";

const SERVERS_PER_PAGE = 25;

export const load: PageServerLoad = async ({ url }) => {
    const page = pageParam(url);
    const params = url.searchParams;
    const filters = parseFilters(params);
    const { name } = filters;
    const defaultSort: Sort = name ? "relevance" : "rank";
    const requestedSort = params.get("sort") as Sort | null;
    const sort =
        requestedSort &&
        SORTS.includes(requestedSort) &&
        (requestedSort !== "relevance" || name)
            ? requestedSort
            : defaultSort;

    const [matches, allServers] = await Promise.all([
        findServers(filters),
        db
            .select({
                tags: serverTable.tags,
                versionString: serverTable.versionString,
            })
            .from(serverTable),
    ]);

    // Filter options come from every server, not just the current results.
    // Tags are grouped case-insensitively and shown in their most common casing.
    const tagCounts = new Map<string, Map<string, number>>();
    for (const server of allServers) {
        for (const t of parseTags(server.tags)) {
            const spellings = tagCounts.get(t.toLowerCase()) ?? new Map();
            spellings.set(t, (spellings.get(t) ?? 0) + 1);
            tagCounts.set(t.toLowerCase(), spellings);
        }
    }
    const tagOptions = [...tagCounts.values()]
        .map((spellings) => {
            const entries = [...spellings.entries()];
            const count = entries.reduce((sum, [, n]) => sum + n, 0);
            const label = entries.sort((a, b) => b[1] - a[1])[0][0];
            return { label, count };
        })
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    const versionOptions = releaseOptions(
        allServers.map((server) => server.versionString),
    );

    let servers = matches;

    const uptimes = await getUptimes(servers.map((server) => server.id));
    const uptimeOf = (id: number) => uptimes.get(id) ?? -1;
    if (sort === "players") {
        servers.sort((a, b) => b.onlinePlayers - a.onlinePlayers);
    } else if (sort === "uptime") {
        servers.sort((a, b) => uptimeOf(b.id) - uptimeOf(a.id));
    } else if (sort === "newest") {
        servers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === "name") {
        servers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "rank" && name) {
        // Search results come back by relevance, so re-sort by rank.
        servers.sort(
            (a, b) =>
                (a.rank || Number.MAX_SAFE_INTEGER) -
                (b.rank || Number.MAX_SAFE_INTEGER),
        );
    }

    const total = servers.length;
    servers = servers.slice(
        (page - 1) * SERVERS_PER_PAGE,
        page * SERVERS_PER_PAGE,
    );

    return {
        servers: servers.map((server) => ({
            ...server,
            uptime: uptimes.get(server.id) ?? null,
        })),
        page,
        pageCount: Math.max(1, Math.ceil(total / SERVERS_PER_PAGE)),
        total,
        ...filters,
        sort,
        defaultSort,
        tagOptions,
        versionOptions,
    };
};
