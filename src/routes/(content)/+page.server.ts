import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { asc, isNotNull, sql } from "drizzle-orm";

export const load: PageServerLoad = async () => {
    const [sponsors, topServers] = await Promise.all([
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
    ]);
    return { sponsors, topServers };
};
