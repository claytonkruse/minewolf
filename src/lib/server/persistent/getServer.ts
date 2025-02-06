import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { serverTable, type Server, type User } from "../drizzle/schema";
import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 60 * 10,
});

export async function getServer(id: number) {
    let server = cache.get(id);

    if (!server) {
        server = db.query.serverTable.findFirst({
            where: eq(serverTable.id, id),
            with: { user: true },
        });
        if (!server) return null;
        cache.set(id, server);
    } else {
        db.query.serverTable
            .findFirst({
                where: eq(serverTable.id, id),
                with: { user: true },
            })
            .then((fresh) => cache.set(id, fresh));
    }

    return server;
}
