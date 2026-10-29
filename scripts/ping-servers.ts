// Pings every listed Minecraft server and stores the result.
// Run outside of SvelteKit (via cron), so no `$lib` / `$env` imports here.
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { and, eq, gte, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import * as schema from "../src/lib/server/db/drizzle/schema";
import { pingServer } from "../src/lib/server/pingServer";
import { geolocate } from "../src/lib/server/geolocate";
import { assignRanks, rankScore } from "../src/lib/server/rankScore";

const { serverTable, serverUptimeTable, voteTable } = schema;

const pool = new pg.Pool({
    connectionString:
        process.env.DB_URL ||
        "postgres://postgres:postgres@localhost:5432/postgres",
});
const db = drizzle(pool, { schema });

type ServerRow = {
    id: number;
    address: string;
    port: number;
    online: boolean;
    countryCheckedAt: Date | null;
};

// what happened to the country during one server's update
type CountryResult = "skipped" | "updated" | "failed";

const log = (msg: string) => console.log(`[ping-servers] ${msg}`);

// servers rarely move, so only re-check the country once a day
const COUNTRY_RECHECK_MS = 24 * 60 * 60 * 1000;
// servers pinged at once; matches pg.Pool's default of 10 connections
const CONCURRENCY = 10;
// ranking windows: votes and players over a week, uptime over a month
const RANK_VOTE_DAYS = 7;
const RANK_UPTIME_DAYS = 30;

// Counts this ping toward today's uptime. Days use the database's
// current_date, matching how votes and views are bucketed.
async function recordUptime(
    serverId: number,
    online: boolean,
    players: number,
) {
    const onlinePings = online ? 1 : 0;
    await db
        .insert(serverUptimeTable)
        .values({
            serverId,
            day: sql`current_date`,
            pings: 1,
            onlinePings,
            players,
        })
        .onConflictDoUpdate({
            target: [serverUptimeTable.serverId, serverUptimeTable.day],
            set: {
                pings: sql`${serverUptimeTable.pings} + 1`,
                onlinePings: sql`${serverUptimeTable.onlinePings} + ${onlinePings}`,
                players: sql`${serverUptimeTable.players} + ${players}`,
            },
        });
}

async function updateServer({
    id,
    address,
    port,
    online: wasOnline,
    countryCheckedAt,
}: ServerRow): Promise<{ online: boolean; country: CountryResult }> {
    // the port column defaults to 25565, so treat that as "no port given"
    // to allow servers like 2b2t.org that only resolve through an SRV record
    const pingData = await pingServer(
        address,
        port === 25565 ? undefined : port,
    );
    if (!pingData.online) {
        // offline: keep the last known MOTD and icon, but not player counts
        await db
            .update(serverTable)
            .set({
                online: false,
                onlinePlayers: 0,
                maxPlayers: 0,
                lastPingAt: new Date(),
            })
            .where(eq(serverTable.id, id));
        await recordUptime(id, false, 0);
        if (wasOnline) log(`server ${id} (${address}) went offline`);
        return { online: false, country: "skipped" };
    }
    const recheckCountry =
        !countryCheckedAt ||
        Date.now() - countryCheckedAt.getTime() > COUNTRY_RECHECK_MS;
    // a failed lookup leaves the last known country in place
    const country = recheckCountry ? await geolocate(pingData.ip) : undefined;
    await db
        .update(serverTable)
        .set({
            online: true,
            onlinePlayers: pingData.players.online,
            maxPlayers: pingData.players.max,
            iconUrl: pingData.icon,
            cleanMotd: pingData.motd.clean.join("\n"),
            htmlMotd: sanitizeHtml(pingData.motd.html.join("<br />"), {
                allowedTags: ["span", "br"],
                allowedAttributes: {
                    span: ["style"],
                },
            }),
            lastOnlineAt: new Date(),
            lastPingAt: new Date(),
            ...(country && { country, countryCheckedAt: new Date() }),
        })
        .where(eq(serverTable.id, id));
    await recordUptime(id, true, pingData.players.online);
    if (!wasOnline) log(`server ${id} (${address}) is back online`);
    return {
        online: true,
        country: !recheckCountry ? "skipped" : country ? "updated" : "failed",
    };
}

async function updateAllServers() {
    const startedAt = Date.now();
    const servers = await db
        .select({
            id: serverTable.id,
            address: serverTable.address,
            port: serverTable.port,
            online: serverTable.online,
            countryCheckedAt: serverTable.countryCheckedAt,
        })
        .from(serverTable);

    log(`pinging ${servers.length} servers, ${CONCURRENCY} at a time`);

    let failed = 0;
    let online = 0;
    const countries = { updated: 0, failed: 0 };
    let next = 0;
    // each worker takes the next unpinged server until none are left
    async function worker() {
        while (next < servers.length) {
            const server = servers[next++];
            try {
                const result = await updateServer(server);
                if (result.online) online++;
                if (result.country !== "skipped") countries[result.country]++;
            } catch (e) {
                failed++;
                console.error(`Failed to ping server ${server.id}:`, e);
            }
        }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    const offline = servers.length - online - failed;
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    log(
        `${new Date().toISOString()} pinged ${servers.length} servers in ${seconds}s: ` +
            `${online} online, ${offline} offline, ${failed} failed; ` +
            `countries ${countries.updated} updated, ${countries.failed} failed`,
    );
}

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

// Recomputes every server's rank from the score in rankScore.ts.
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
    await updateAllServers();
    await rankServers();
} finally {
    await pool.end();
}
