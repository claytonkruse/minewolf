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
    const pingData = await pingServer(`${address}:${port}`);
    if (!pingData) return;
    await db
        .update(serverTable)
        .set({
            online: pingData.online,
            onlinePlayers: pingData.players?.online,
            maxPlayers: pingData.players?.max,
            cleanMotd: pingData.motd?.clean.join("\n"),
            htmlMotd:
                pingData.motd &&
                sanitizeHtml(pingData.motd.html.join("<br />"), {
                    allowedTags: ["span", "br"],
                    allowedAttributes: {
                        span: ["style"],
                    },
                }),
            lastOnlineAt: pingData.online ? new Date() : undefined,
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
