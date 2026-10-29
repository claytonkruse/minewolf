// Pings every listed Minecraft server and stores the result.
// Run outside of SvelteKit (via cron), so no `$lib` / `$env` imports here.
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import * as schema from "../src/lib/server/db/drizzle/schema";
import { pingServer } from "../src/lib/server/pingServer";
import { geolocate } from "../src/lib/server/geolocate";

const { serverTable, serverUptimeTable } = schema;

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

try {
    await updateAllServers();
} finally {
    await pool.end();
}
