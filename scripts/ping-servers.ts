// Pings every listed Minecraft server and stores the result.
// Run outside of SvelteKit (via cron), so no `$lib` / `$env` imports here.
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import * as schema from "../src/lib/server/db/drizzle/schema";
import { pingServer } from "../src/lib/server/pingServer";

const { serverTable } = schema;

const pool = new pg.Pool({
    connectionString:
        process.env.DB_URL ||
        "postgres://postgres:postgres@localhost:5432/postgres",
});
const db = drizzle(pool, { schema });

type ServerRow = { id: number; address: string; port: number };

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
