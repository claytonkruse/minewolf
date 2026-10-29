// Recomputes every server's rank from the score in rankScore.ts.
// Run outside of SvelteKit (via cron), so no `$lib` / `$env` imports here.
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { and, eq, gte, sql } from "drizzle-orm";
import * as schema from "../src/lib/server/db/drizzle/schema";
import { assignRanks, rankScore } from "../src/lib/server/rankScore";

const { serverTable, serverUptimeTable, voteTable } = schema;

const pool = new pg.Pool({
    connectionString:
        process.env.DB_URL ||
        "postgres://postgres:postgres@localhost:5432/postgres",
});
const db = drizzle(pool, { schema });

const log = (msg: string) => console.log(`[rank-servers] ${msg}`);

// ranking windows: votes and players over a week, uptime over a month
const RANK_VOTE_DAYS = 7;
const RANK_UPTIME_DAYS = 30;

// Sums a column over the last `days` days of server_uptime, per server.
function uptimeSince(days: number) {
    return db
        .select({
            serverId: serverUptimeTable.serverId,
            pings: sql<number>`sum(${serverUptimeTable.pings})::int`,
            onlinePings: sql<number>`sum(${serverUptimeTable.onlinePings})::int`,
            players: sql<number>`sum(${serverUptimeTable.players})::int`,
        })
        .from(serverUptimeTable)
        .where(gte(serverUptimeTable.day, sql`current_date - ${days - 1}::int`))
        .groupBy(serverUptimeTable.serverId);
}

async function rankServers() {
    const [servers, votes, week, month] = await Promise.all([
        db
            .select({ id: serverTable.id, rank: serverTable.rank })
            .from(serverTable)
            .orderBy(serverTable.createdAt),
        db
            .select({
                serverId: voteTable.serverId,
                count: sql<number>`count(*)::int`,
            })
            .from(voteTable)
            .where(
                gte(
                    voteTable.createdAt,
                    sql`now() - make_interval(days => ${RANK_VOTE_DAYS})`,
                ),
            )
            .groupBy(voteTable.serverId),
        uptimeSince(RANK_VOTE_DAYS),
        uptimeSince(RANK_UPTIME_DAYS),
    ]);

    const votesById = new Map(votes.map((v) => [v.serverId, v.count]));
    const weekById = new Map(week.map((u) => [u.serverId, u]));
    const monthById = new Map(month.map((u) => [u.serverId, u]));
    // older servers win ties, since servers are ordered by createdAt
    const ranks = assignRanks(
        servers.map(({ id }) => {
            const w = weekById.get(id);
            const m = monthById.get(id);
            return {
                id,
                score: rankScore({
                    votes: votesById.get(id) ?? 0,
                    avgPlayers: w?.pings ? w.players / w.pings : 0,
                    uptime: m?.pings ? m.onlinePings / m.pings : 0,
                }),
            };
        }),
    );

    const changed = servers.filter(({ id, rank }) => ranks.get(id) !== rank);
    await db.transaction(async (tx) => {
        for (const { id } of changed) {
            await tx
                .update(serverTable)
                .set({ rank: ranks.get(id) })
                .where(eq(serverTable.id, id));
        }
        // keep today's rank for the server page's rank history
        await tx
            .update(serverUptimeTable)
            .set({ rank: serverTable.rank })
            .from(serverTable)
            .where(
                and(
                    eq(serverUptimeTable.serverId, serverTable.id),
                    eq(serverUptimeTable.day, sql`current_date`),
                ),
            );
    });
    const rankedCount = [...ranks.values()].filter((r) => r > 0).length;
    log(
        `ranked ${rankedCount} of ${servers.length} servers, ${changed.length} changed`,
    );
}

try {
    await rankServers();
} finally {
    await pool.end();
}
