import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ url }) => {
    const page = Math.floor(Number(url.searchParams.get("p"))) || 1;
    const name: string | null = url.searchParams.get("name");
    const servers = name
        ? await db.select().from(serverTable).where(eq(serverTable.name, name))
        : await db.select().from(serverTable);
    return { servers, page };
};
