import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

// Case-insensitive partial match on name, public address, tags and description.
export async function searchServers(query: string) {
    // Escape LIKE wildcards so the query is matched literally.
    const escaped = query.replace(/[\\%_]/g, "\\$&");
    const contains = `%${escaped}%`;
    return (
        db
            .select()
            .from(serverTable)
            .where(
                or(
                    ilike(serverTable.name, contains),
                    and(
                        eq(serverTable.addressPrivate, false),
                        ilike(serverTable.address, contains),
                    ),
                    ilike(serverTable.tags, contains),
                    ilike(serverTable.description, contains),
                ),
            )
            // Exact name matches first, then names starting with the query,
            // then names containing it, then address/tag matches, then
            // description-only matches.
            .orderBy(
                sql`case
                when ${serverTable.name} ilike ${escaped} then 0
                when ${serverTable.name} ilike ${`${escaped}%`} then 1
                when ${serverTable.name} ilike ${contains} then 2
                when ${serverTable.tags} ilike ${contains} then 3
                when not ${serverTable.addressPrivate}
                    and ${serverTable.address} ilike ${contains} then 3
                else 4
            end`,
                asc(serverTable.name),
            )
    );
}
