import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { db } from "$lib/server/db/drizzle/db";
import {
    serverTable,
    userTable,
    voteTable,
} from "$lib/server/db/drizzle/schema";
import { hasRole } from "$lib/server/roles";
import { searchServers } from "$lib/server/searchServers";
import {
    addSponsor,
    getSponsorIds,
    removeSponsor,
    setSponsorOrder,
} from "$lib/server/sponsors";
import { asc, count, desc, eq, ilike, isNotNull, or } from "drizzle-orm";

const RECENT_VOTES_LIMIT = 25;
const USERS_LIMIT = 50;

// Newest users first, optionally filtered by name, Discord ID or email.
function getUsers(query: string) {
    const escaped = query.replace(/[\\%_]/g, "\\$&");
    const contains = `%${escaped}%`;
    return db
        .select({
            id: userTable.id,
            name: userTable.name,
            discordId: userTable.discordId,
            email: userTable.email,
            createdAt: userTable.createdAt,
            lastOnlineAt: userTable.lastOnlineAt,
            servers: count(serverTable.id),
        })
        .from(userTable)
        .leftJoin(serverTable, eq(serverTable.userId, userTable.id))
        .where(
            query
                ? or(
                      ilike(userTable.name, contains),
                      ilike(userTable.discordId, contains),
                      ilike(userTable.email, contains),
                  )
                : undefined,
        )
        .groupBy(userTable.id)
        .orderBy(desc(userTable.createdAt))
        .limit(USERS_LIMIT);
}

export const load = (async ({ parent, url }) => {
    // Page and layout loads run in parallel; wait for the admin check first.
    await parent();

    const sponsorQuery = url.searchParams.get("q")?.trim() || "";
    const userQuery = url.searchParams.get("user")?.trim() || "";

    const [
        users,
        servers,
        votes,
        roles,
        sponsors,
        searchResults,
        recentVotes,
        userList,
    ] = await Promise.all([
        db.$count(userTable),
        db.$count(serverTable),
        db.$count(voteTable),
        db.query.userRoleTable.findMany({
            with: { user: { columns: { name: true, discordId: true } } },
            orderBy: (r, { asc }) => [asc(r.role), asc(r.createdAt)],
        }),
        db
            .select({ id: serverTable.id, name: serverTable.name })
            .from(serverTable)
            .where(isNotNull(serverTable.sponsorPosition))
            .orderBy(asc(serverTable.sponsorPosition)),
        sponsorQuery ? searchServers(sponsorQuery) : [],
        db
            .select({
                id: voteTable.id,
                minecraftUsername: voteTable.minecraftUsername,
                ip: voteTable.ip,
                createdAt: voteTable.createdAt,
                serverId: serverTable.id,
                serverName: serverTable.name,
            })
            .from(voteTable)
            .innerJoin(serverTable, eq(voteTable.serverId, serverTable.id))
            .orderBy(desc(voteTable.createdAt))
            .limit(RECENT_VOTES_LIMIT),
        getUsers(userQuery),
    ]);

    return {
        stats: { users, servers, votes },
        roles,
        recentVotes,
        userQuery,
        userList,
        sponsors,
        sponsorQuery,
        sponsorResults: searchResults
            .filter((server) => server.sponsorPosition === null)
            .map(({ id, name, address, addressPrivate }) => ({
                id,
                name,
                address: addressPrivate ? null : address,
            })),
    };
}) satisfies PageServerLoad;

function requireAdmin(locals: App.Locals) {
    // Actions don't run the layout load, so check the role here too.
    if (!hasRole(locals.user, "admin"))
        error(403, "You are not authorized to manage sponsors.");
}

function getServerId(formData: FormData) {
    const id = Number(formData.get("serverId"));
    return Number.isInteger(id) && id > 0 ? id : null;
}

export const actions = {
    addSponsor: async ({ locals, request }) => {
        requireAdmin(locals);
        const id = getServerId(await request.formData());
        if (!id) return fail(400, { message: "Choose a server to add." });

        if (!(await addSponsor(id)))
            return fail(400, {
                message: "That server doesn't exist or is already a sponsor.",
            });
    },

    removeSponsor: async ({ locals, request }) => {
        requireAdmin(locals);
        const id = getServerId(await request.formData());
        if (!id) return fail(400, { message: "Invalid server." });

        await removeSponsor(id);
    },

    moveSponsor: async ({ locals, request }) => {
        requireAdmin(locals);
        const formData = await request.formData();
        const id = getServerId(formData);
        const offset = formData.get("direction") === "up" ? -1 : 1;

        const ids = await getSponsorIds();
        const from = id ? ids.indexOf(id) : -1;
        const to = from + offset;
        if (from === -1 || to < 0 || to >= ids.length)
            return fail(400, { message: "Can't move that sponsor." });

        [ids[from], ids[to]] = [ids[to], ids[from]];
        await setSponsorOrder(ids);
    },
} satisfies Actions;
