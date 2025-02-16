import type { Handle } from "@sveltejs/kit";
import { validateSession } from "$lib/server/session";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import pingServer from "$lib/server/pingServer";
import { eq } from "drizzle-orm";

let requestCount = 0;

let lastPingedServers = Date.now() - 1000 * 60 * 10;

async function updateServer(id: number) {
    const pingData = await pingServer("" + id);
    if (!pingData) return;
    await db
        .update(serverTable)
        .set({
            online: pingData.online,
            onlinePlayers: pingData.players.online,
            maxPlayers: pingData.players.max,
            cleanMotd: pingData.motd.clean.join("\n"),
            htmlMotd: pingData.motd.html.join("<br>"),
            lastOnlineAt: pingData.online ? new Date() : undefined,
            lastPingAt: new Date(),
        })
        .where(eq(serverTable.id, id));
}

async function updateAllServers() {
    const servers = await db.select({ id: serverTable.id }).from(serverTable);
    for (const server of servers) {
        await updateServer(server.id);
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    requestCount++;
    console.log(`Req: ${requestCount}`);
    console.log(event.request);
    const { cookies } = event;
    const session = await validateSession(cookies);
    if (!session) return await resolve(event);
    const { user } = session;

    event.locals.session = session;
    event.locals.user = user;

    // ping servers async
    if (Date.now() > lastPingedServers + 1000 * 60 * 10) {
        // do not await
        updateAllServers();
        lastPingedServers = Date.now();
    }

    return await resolve(event);
};
