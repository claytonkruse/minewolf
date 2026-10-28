import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { withUptime } from "$lib/server/analytics";
import { serverTable, voteTable } from "$lib/server/db/drizzle/schema";
import {
    asc,
    desc,
    eq,
    getTableColumns,
    isNotNull,
    max,
    sql,
} from "drizzle-orm";

export const load: PageServerLoad = async () => {
    const [sponsors, topServers, recentlyVoted] = await Promise.all([
        db
            .select()
            .from(serverTable)
            .where(isNotNull(serverTable.sponsorPosition))
            .orderBy(asc(serverTable.sponsorPosition)),
        db
            .select()
            .from(serverTable)
            // Rank 0 means unranked, so those go after ranked servers.
            .orderBy(
                sql`${serverTable.rank} = 0`,
                asc(serverTable.rank),
                asc(serverTable.name),
            )
            .limit(10),
        // Servers ordered by their most recent vote.
        db
            .select(getTableColumns(serverTable))
            .from(serverTable)
            .innerJoin(voteTable, eq(voteTable.serverId, serverTable.id))
            .groupBy(serverTable.id)
            .orderBy(desc(max(voteTable.createdAt)))
            .limit(10),
    ]);
    return {
        sponsors: await withUptime(sponsors),
        topServers: await withUptime(topServers),
        recentlyVoted: await withUptime(recentlyVoted),
    };
};
