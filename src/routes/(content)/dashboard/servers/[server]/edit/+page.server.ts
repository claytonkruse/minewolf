import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { updateServerSchema as schema } from "$lib/zod-schemas";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { error, redirect } from "@sveltejs/kit";
import { and, ConsoleLogWriter, eq } from "drizzle-orm";
import { temp_url } from "$lib/utils/redirect_urls";
import fs from "fs/promises";
import sharp from "sharp";

export const load = (async ({ locals, params }) => {
    const { user } = locals;
    if (!user)
        redirect(
            303,

            temp_url("/login/", `/dashboard/servers/${params.server}/edit/`),
        );

    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
    });

    if (!server) error(404, "Server not found.");
    if (server.userId !== user.id)
        error(403, "You are not allowed to edit this server.");

    const {
        id,
        userId,
        createdAt,
        lastPingAt,
        lastOnlineAt,

        rank,
        online,
        onlinePlayers,
        maxPlayers,
        iconUrl,
        cleanMotd,
        htmlMotd,
        crossplay,
        bannerUrl,
        ...userChangeable
    } = server; // remove fields that cannot be changed by user

    const form = await superValidate(zod(schema.default(userChangeable)));

    return { server, form };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const { locals, params } = event;
        const { user } = locals;
        if (!user) return fail(401, { message: "Unauthenticated." });

        const form = await superValidate(event, zod(schema));
        if (!form.valid) return fail(400, { form });

        const { bannerFile, ...rest } = form.data;

        try {
            let bannerGood = false;
            if (bannerFile) {
                const aBuffer = await bannerFile.arrayBuffer();

                const webp = await sharp(Buffer.from(aBuffer), {
                    animated: true,
                })
                    .toFormat("webp")
                    .toBuffer();

                await fs
                    .writeFile(
                        `storage/server-banners/${params.server}.webp`,
                        webp,
                    )
                    .catch((e) => error(500, e));
                bannerGood = true;
            }

            await db
                .update(serverTable)
                .set({
                    ...rest,
                    bannerUrl: bannerGood
                        ? `/servers/${params.server}/banner.webp?v=${Date.now().toString().slice(-6)}`
                        : undefined,
                })
                .where(
                    and(
                        eq(serverTable.id, Number(params.server)),
                        eq(serverTable.userId, user.id),
                    ),
                );
        } catch (e) {
            return fail(500, {
                message: "Failed to update server data.",
            });
        }

        redirect(303, `/servers/${params.server}/`);
    },
};
