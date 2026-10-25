import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import {
    serverTable,
    userTable,
    voteTable,
} from "$lib/server/db/drizzle/schema";

export const load = (async ({ parent }) => {
    // Page and layout loads run in parallel; wait for the admin check first.
    await parent();

    const [users, servers, votes, roles] = await Promise.all([
        db.$count(userTable),
        db.$count(serverTable),
        db.$count(voteTable),
        db.query.userRoleTable.findMany({
            with: { user: { columns: { name: true, discordId: true } } },
            orderBy: (r, { asc }) => [asc(r.role), asc(r.createdAt)],
        }),
    ]);

    return { stats: { users, servers, votes }, roles };
}) satisfies PageServerLoad;
