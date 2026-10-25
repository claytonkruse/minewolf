import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ url }) => {
    const page = Math.floor(Number(url.searchParams.get("p"))) || 1;
    const name: string | null = url.searchParams.get("name");
    const tag = url.searchParams.get("tag")?.trim() || null;
    let servers = name
        ? await db.select().from(serverTable).where(eq(serverTable.name, name))
        : await db.select().from(serverTable);
    if (tag) {
        const wanted = tag.toLowerCase();
        servers = servers.filter((server) =>
            server.tags
                .split(",")
                .some((t) => t.trim().toLowerCase() === wanted),
        );
    }
    return { servers, page, tag };
};
