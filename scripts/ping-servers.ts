// Pings every listed Minecraft server and stores the result.
// Run outside of SvelteKit (via cron), so no `$lib` / `$env` imports here.
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import * as schema from "../src/lib/server/db/drizzle/schema";
import { pingServer } from "../src/lib/server/pingServer";

const { serverTable, serverUptimeTable } = schema;

const pool = new pg.Pool({
    connectionString:
        process.env.DB_URL ||
        "postgres://postgres:postgres@localhost:5432/postgres",
});
const db = drizzle(pool, { schema });

type ServerRow = { id: number; address: string; port: number };

// Counts this ping toward today's uptime. Days use the database's
// current_date, matching how votes and views are bucketed.
async function recordUptime(serverId: number, online: boolean) {
    const onlinePings = online ? 1 : 0;
    await db
        .insert(serverUptimeTable)
        .values({ serverId, day: sql`current_date`, pings: 1, onlinePings })
        .onConflictDoUpdate({
            target: [serverUptimeTable.serverId, serverUptimeTable.day],
            set: {
                pings: sql`${serverUptimeTable.pings} + 1`,
                onlinePings: sql`${serverUptimeTable.onlinePings} + ${onlinePings}`,
            },
        });
}

async function updateServer({ id, address, port }: ServerRow) {
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
        await recordUptime(id, false);
        return;
    }
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
        })
        .where(eq(serverTable.id, id));
    await recordUptime(id, true);
}

async function updateAllServers() {
    const servers = await db
        .select({
            id: serverTable.id,
            address: serverTable.address,
            port: serverTable.port,
        })
        .from(serverTable);

    let failed = 0;
    for (const server of servers) {
        try {
            await updateServer(server);
        } catch (e) {
            failed++;
            console.error(`Failed to ping server ${server.id}:`, e);
        }
    }
    console.log(
        `[ping-servers] ${new Date().toISOString()} pinged ${servers.length} servers (${failed} failed)`,
    );
}

try {
    await updateAllServers();
} finally {
    await pool.end();
}
