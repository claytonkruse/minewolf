import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { temp_url } from "$lib/utils/redirect_urls";
import { serverTable } from "$lib/server/drizzle/schema";
import { db } from "$lib/server/drizzle/db";
import { eq } from "drizzle-orm";

export const load = (async ({ locals, url, params }) => {
    const { user } = locals;
    if (!user) redirect(303, temp_url("/login/", url.href));

    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
    });
    if (!server) error(404, "That server doesn't exist.");

    return { name: server.name };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ locals, params }) => {
        const { user } = locals;
        if (!user) error(401, "You must be authenticated to remove a server.");

        const server = await db.query.serverTable.findFirst({
            where: eq(serverTable.id, Number(params.server)),
        });
        if (!server) error(404, "That server doesn't exist.");
        if (server.userId !== user.id)
            error(403, "You are not authorized to remove this server.");

        try {
            await db.delete(serverTable).where(eq(serverTable.id, server.id));
        } catch (e) {
            error(
                500,
                "An error occurred while removing the server from the database.",
            );
        }

        redirect(303, `./success/?name=${server.name}`);
    },
} satisfies Actions;
