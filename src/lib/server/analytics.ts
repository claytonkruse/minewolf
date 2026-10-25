import { db } from "$lib/server/db/drizzle/db";
import {
    serverTable,
    serverViewTable,
    voteTable,
    type ViewKind,
} from "$lib/server/db/drizzle/schema";
import { and, eq, gte, inArray, sql } from "drizzle-orm";

export const ANALYTICS_DAYS = 30;

export type AnalyticsDay = {
    date: Date;
    votes: number;
    listingViews: number;
    pageViews: number;
};

// Days are bucketed by the database's current_date so votes and views agree.
const today = sql`current_date`;

export async function recordViews(serverIds: number[], kind: ViewKind) {
    const existing = await db
        .select({ id: serverTable.id })
        .from(serverTable)
        .where(inArray(serverTable.id, serverIds));
    if (existing.length === 0) return;

    await db
        .insert(serverViewTable)
        .values(
            existing.map(({ id }) => ({
                serverId: id,
                kind,
                day: today,
                count: 1,
            })),
        )
        .onConflictDoUpdate({
            target: [
                serverViewTable.serverId,
                serverViewTable.kind,
                serverViewTable.day,
            ],
            set: { count: sql`${serverViewTable.count} + 1` },
        });
}

export async function getServerAnalytics(
    serverId: number,
): Promise<AnalyticsDay[]> {
    const [{ start }] = await db
        .execute<{ start: string }>(
            sql`select (${today} - ${ANALYTICS_DAYS - 1}::int)::text as start`,
        )
        .then((result) => result.rows);

    const voteDay = sql<string>`${voteTable.createdAt}::date::text`;
    const [votes, views] = await Promise.all([
        db
            .select({ day: voteDay, count: sql<number>`count(*)::int` })
            .from(voteTable)
            .where(
                and(
                    eq(voteTable.serverId, serverId),
                    gte(voteTable.createdAt, sql`${start}::date`),
                ),
            )
            .groupBy(voteDay),
        db
            .select({
                day: serverViewTable.day,
                kind: serverViewTable.kind,
                count: serverViewTable.count,
            })
            .from(serverViewTable)
            .where(
                and(
                    eq(serverViewTable.serverId, serverId),
                    gte(serverViewTable.day, start),
                ),
            ),
    ]);

    const days = new Map<string, AnalyticsDay>();
    for (let i = 0; i < ANALYTICS_DAYS; i++) {
        const date = new Date(`${start}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + i);
        days.set(date.toISOString().slice(0, 10), {
            date,
            votes: 0,
            listingViews: 0,
            pageViews: 0,
        });
    }
    for (const { day, count } of votes) {
        const entry = days.get(day);
        if (entry) entry.votes = count;
    }
    for (const { day, kind, count } of views) {
        const entry = days.get(day);
        if (!entry) continue;
        if (kind === "listing") entry.listingViews = count;
        else entry.pageViews = count;
    }
    return [...days.values()];
}
