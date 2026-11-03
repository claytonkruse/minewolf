import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db/drizzle/db";
import {
    serverTable,
    userTable,
    voteTable,
} from "$lib/server/db/drizzle/schema";
import { count, desc, eq } from "drizzle-orm";

export const load = (async ({ parent, params }) => {
    // Page and layout loads run in parallel; wait for the admin check first.
    await parent();

    const [member, servers] = await Promise.all([
        db.query.userTable.findFirst({
            where: eq(userTable.id, params.user),
            with: { roles: { columns: { role: true, createdAt: true } } },
        }),
        db
            .select({
                id: serverTable.id,
                name: serverTable.name,
                address: serverTable.address,
                port: serverTable.port,
                online: serverTable.online,
                rank: serverTable.rank,
                sponsorPosition: serverTable.sponsorPosition,
                createdAt: serverTable.createdAt,
                votes: count(voteTable.id),
            })
            .from(serverTable)
            .leftJoin(voteTable, eq(voteTable.serverId, serverTable.id))
            .where(eq(serverTable.userId, params.user))
            .groupBy(serverTable.id)
            .orderBy(desc(serverTable.createdAt)),
    ]);

    if (!member) error(404, "User not found.");

    return { member, servers };
}) satisfies PageServerLoad;
