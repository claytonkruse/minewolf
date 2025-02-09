import type { PageServerLoad, Actions } from "./$types";
import sanitizeHtml from "sanitize-html";
import { error, fail, redirect } from "@sveltejs/kit";
import pingServer from "$lib/server/pingServer";
import { InsertServerSchema } from "$lib/public-zod-schemas";
import { superValidate, setError } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { temp_url } from "$lib/utils/redirect_urls";
import { z } from "zod";

const PublicSchema = z.object({
    "cf-turnstile-response": z
        .string({ required_error: "CAPTCHA error." })
        .nonempty("CAPTCHA error."),
    ...InsertServerSchema.shape,
});

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, temp_url("/login/", "/add-server/"));

    const form = await superValidate(zod(PublicSchema));

    return { form };
};

import { TurnstileSchema } from "$lib/server/private-zod-schemas";
export const actions: Actions = {
    default: async ({ locals, request }) => {
        const { user } = locals;
        if (!user) error(401, "Unauthenticated.");

        const form = await superValidate(request, zod(PublicSchema));
        if (!form.valid) return fail(400, { form });

        // Cloudflare Turnstile Validation
        // Validating server side to preserve secret.
        const turnstileParse = await TurnstileSchema.safeParseAsync(
            form.data["cf-turnstile-response"],
        );
        if (!turnstileParse.success) {
            setError(form, "cf-turnstile-response", "CAPTCHA error.");
            return fail(400, { form });
        }

        const { address } = form.data;
        let pingData = await pingServer(address);
        if (!pingData?.online) {
            setError(
                form,
                "address",
                "Could not connect to the Minecraft server.",
            );
            return fail(400, { form });
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
            setError(
                form,
                "address",
                "Error while adding server to the database.",
            );
            return fail(500, { form });
        }
        redirect(303, `/dashboard/servers/${server.id}/edit/`);
    },
};
