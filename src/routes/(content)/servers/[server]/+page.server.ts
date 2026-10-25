import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { eq, ne } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { hasRole } from "$lib/server/roles";
import { addSponsor, removeSponsor } from "$lib/server/sponsors";

const SIMILAR_LIMIT = 5;

function parseTags(tags: string) {
    return tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
}

export const load: PageServerLoad = async ({ params, locals }) => {
    const serverId = Number(params.server);

    const server = (
        await db
            .select()
            .from(serverTable)
            .limit(1)
            .where(eq(serverTable.id, serverId))
            .catch((e) => error(400, "Database error."))
    )[0];

    if (!server) error(404, "Server listing not found.");

    const tags = new Set(parseTags(server.tags));
    const others = tags.size
        ? await db
              .select({
                  id: serverTable.id,
                  name: serverTable.name,
                  iconUrl: serverTable.iconUrl,
                  rank: serverTable.rank,
                  online: serverTable.online,
                  onlinePlayers: serverTable.onlinePlayers,
                  maxPlayers: serverTable.maxPlayers,
                  tags: serverTable.tags,
                  description: serverTable.description,
                  versionString: serverTable.versionString,
                  htmlMotd: serverTable.htmlMotd,
                  bannerUrl: serverTable.bannerUrl,
                  whitelisted: serverTable.whitelisted,
                  crossplay: serverTable.crossplay,
              })
              .from(serverTable)
              .where(ne(serverTable.id, serverId))
              .catch(() => [])
        : [];

    // Most shared tags first, then by rank (unranked servers last).
    const similarServers = others
        .map((other) => {
            const allTags = other.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
            return {
                ...other,
                allTags,
                sharedTags: allTags.filter((tag) =>
                    tags.has(tag.toLowerCase()),
                ),
            };
        })
        .filter((other) => other.sharedTags.length > 0)
        .sort(
            (a, b) =>
                b.sharedTags.length - a.sharedTags.length ||
                (a.rank || Number.MAX_SAFE_INTEGER) -
                    (b.rank || Number.MAX_SAFE_INTEGER),
        )
        .slice(0, SIMILAR_LIMIT);

    const { user } = locals;
    return { server, user, similarServers };
};

function requireAdmin(locals: App.Locals) {
    if (!hasRole(locals.user, "admin"))
        error(403, "You are not authorized to manage sponsors.");
}

export const actions = {
    sponsor: async ({ locals, params }) => {
        requireAdmin(locals);
        if (!(await addSponsor(Number(params.server))))
            return fail(400, {
                message: "That server doesn't exist or is already a sponsor.",
            });
    },

    unsponsor: async ({ locals, params }) => {
        requireAdmin(locals);
        await removeSponsor(Number(params.server));
    },
} satisfies Actions;
