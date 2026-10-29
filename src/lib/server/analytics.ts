import { db } from "$lib/server/db/drizzle/db";
import {
    serverTable,
    serverUptimeTable,
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

// First day (YYYY-MM-DD) of the ANALYTICS_DAYS window ending today.
async function windowStart() {
    const [{ start }] = await db
        .execute<{ start: string }>(
            sql`select (${today} - ${ANALYTICS_DAYS - 1}::int)::text as start`,
        )
        .then((result) => result.rows);
    return start;
}

// The ANALYTICS_DAYS dates of the window as UTC midnights, keyed by YYYY-MM-DD.
function windowDays(start: string) {
    const days: [string, Date][] = [];
    for (let i = 0; i < ANALYTICS_DAYS; i++) {
        const date = new Date(`${start}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + i);
        days.push([date.toISOString().slice(0, 10), date]);
    }
    return days;
}

function dailyVotes(serverId: number, start: string) {
    const voteDay = sql<string>`${voteTable.createdAt}::date::text`;
    return db
        .select({ day: voteDay, count: sql<number>`count(*)::int` })
        .from(voteTable)
        .where(
            and(
                eq(voteTable.serverId, serverId),
                gte(voteTable.createdAt, sql`${start}::date`),
            ),
        )
        .groupBy(voteDay);
}

export async function getServerAnalytics(
    serverId: number,
): Promise<AnalyticsDay[]> {
    const start = await windowStart();
    const [votes, views] = await Promise.all([
        dailyVotes(serverId, start),
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
    for (const [key, date] of windowDays(start)) {
        days.set(key, { date, votes: 0, listingViews: 0, pageViews: 0 });
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

export type HistoryDay = {
    date: Date;
    votes: number;
    // Percent of pings that found the server online, or null if it wasn't pinged.
    uptime: number | null;
    // Average online players across the day's pings, or null if it wasn't pinged.
    players: number | null;
    // Rank after the day's last ranking, or null if unranked or not pinged.
    rank: number | null;
};

// Public per-day votes and uptime for a server's page.
export async function getServerHistory(
    serverId: number,
): Promise<HistoryDay[]> {
    const start = await windowStart();
    const [votes, uptime] = await Promise.all([
        dailyVotes(serverId, start),
        db
            .select({
                day: serverUptimeTable.day,
                pings: serverUptimeTable.pings,
                onlinePings: serverUptimeTable.onlinePings,
                players: serverUptimeTable.players,
                rank: serverUptimeTable.rank,
            })
            .from(serverUptimeTable)
            .where(
                and(
                    eq(serverUptimeTable.serverId, serverId),
                    gte(serverUptimeTable.day, start),
                ),
            ),
    ]);

    const days = new Map<string, HistoryDay>();
    for (const [key, date] of windowDays(start)) {
        days.set(key, {
            date,
            votes: 0,
            uptime: null,
            players: null,
            rank: null,
        });
    }
    for (const { day, count } of votes) {
        const entry = days.get(day);
        if (entry) entry.votes = count;
    }
    for (const { day, pings, onlinePings, players, rank } of uptime) {
        const entry = days.get(day);
        if (!entry || pings === 0) continue;
        entry.uptime = (onlinePings / pings) * 100;
        entry.players = players / pings;
        if (rank > 0) entry.rank = rank;
    }
    return [...days.values()];
}

// Uptime percent over the last ANALYTICS_DAYS days for each server, or null
// for servers that haven't been pinged in that time.
export async function getUptimes(
    serverIds: number[],
): Promise<Map<number, number | null>> {
    const uptimes = new Map<number, number | null>(
        serverIds.map((id) => [id, null]),
    );
    if (serverIds.length === 0) return uptimes;

    const start = await windowStart();
    const rows = await db
        .select({
            serverId: serverUptimeTable.serverId,
            pings: sql<number>`sum(${serverUptimeTable.pings})::int`,
            onlinePings: sql<number>`sum(${serverUptimeTable.onlinePings})::int`,
        })
        .from(serverUptimeTable)
        .where(
            and(
                inArray(serverUptimeTable.serverId, serverIds),
                gte(serverUptimeTable.day, start),
            ),
        )
        .groupBy(serverUptimeTable.serverId);
    for (const { serverId, pings, onlinePings } of rows) {
        if (pings > 0) uptimes.set(serverId, (onlinePings / pings) * 100);
    }
    return uptimes;
}

// Adds each server's uptime percent (see getUptimes) for list views.
export async function withUptime<T extends { id: number }>(
    servers: T[],
): Promise<(T & { uptime: number | null })[]> {
    const uptimes = await getUptimes(servers.map((server) => server.id));
    return servers.map((server) => ({
        ...server,
        uptime: uptimes.get(server.id) ?? null,
    }));
}
