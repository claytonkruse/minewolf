import { db } from "$lib/server/drizzle/db";
import { servers } from "$lib/server/drizzle/schema";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ params }) => {
    const server = await db.query.servers.findFirst({
        where: eq(servers.id, Number(params.id)),
    });

    if (!server?.mapUrl) error(404, "That map does not exist in the database.");

    return { server };
};
