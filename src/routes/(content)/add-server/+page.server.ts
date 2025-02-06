import type { PageServerLoad, Actions } from "./$types";
import sanitizeHtml from "sanitize-html";
import { error, fail, redirect } from "@sveltejs/kit";

import pingServer from "$lib/server/pingServer";

import { insertServerSchema } from "$lib/validationSchemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/drizzle/db";
import { serverTable } from "$lib/server/drizzle/schema";
import { temp_url } from "$lib/utils/redirect_urls";
import { z } from "zod";

const schema = z.object({
    ...insertServerSchema.shape,
    turnstileToken: z.string({ required_error: "CAPTCHA error." }),
});

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, temp_url("/login/", "/add-server/"));

    const form = await superValidate(zod(schema));

    return { form };
};

export const actions: Actions = {
    default: async (event) => {
        const { user } = event.locals;
        if (!user) error(401);
        const form = await superValidate(event, zod(insertServerSchema));
        if (!form.valid) return fail(400, { form });

        const { address } = form.data;

        let pingData = await pingServer(address);

        if (!pingData?.online) {
            return fail(400, {
                form,
                message: "Could not connect to the Minecraft server.",
            });
        }

        let server;
        try {
            [server] = await db
                .insert(serverTable)
                .values({
                    ...form.data,
                    userId: user.id,
                    autoVersion: true,
                    htmlMotd: sanitizeHtml(pingData.motd.html.join("<br />"), {
                        allowedTags: ["span", "br"],
                        allowedAttributes: {
                            span: ["style"],
                        },
                    }),
                    iconUrl: pingData.icon,
                    onlinePlayers: pingData.players?.online,
                    maxPlayers: pingData.players?.max,
                    versionString: pingData.version,
                })
                .returning();
        } catch (e) {
            return fail(500, {
                form,
                message: "Error while adding server to the database.",
            });
        }
        redirect(303, `/dashboard/servers/${server.id}/edit/`);
    },
};
