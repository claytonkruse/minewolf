import { db } from "$lib/server/drizzle/db";
import { updateServerSchema as schema } from "$lib/validationSchemas";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { servers } from "$lib/server/drizzle/schema";
import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { and, eq } from "drizzle-orm";
import { temp_url } from "$lib/utils/redirect_urls";

export const load = (async ({ locals, params }) => {
    const { user } = locals;
    if (!user)
        redirect(
            303,
            temp_url("/login/", `/dashboard/servers/${params.server}/edit/`),
        );

    const server = await db.query.servers.findFirst({
        where: eq(servers.id, Number(params.server)),
    });

    if (!server) error(404, "Server not found.");
    if (server.userId !== user.id)
        error(403, "You are not allowed to edit this server.");

    const {
        id,
        userId,
        createdAt,
        lastOnlineAt,
        rank,
        online,
        onlinePlayers,
        maxPlayers,
        iconUrl,
        cleanMotd,
        htmlMotd,
        ...userChangeable
    } = server; // remove fields that cannot be changed by user

    const form = await superValidate(zod(schema.default(userChangeable)));

    return { server, form };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const { locals, params } = event;
        const { user } = locals;
        if (!user) return fail(401, { message: "Unauthorized" });

        const form = await superValidate(event, zod(schema));
        if (!form.valid) return fail(400, { form });

        try {
            await db
                .update(servers)
                .set(form.data)
                .where(
                    and(
                        eq(servers.id, Number(params.server)),
                        eq(servers.userId, user.id),
                    ),
                );
        } catch (e) {
            return fail(500, {
                message: "Failed to update server in the database.",
            });
        }

        redirect(303, `/dashboard/servers/${params.server}/`);
    },
};
