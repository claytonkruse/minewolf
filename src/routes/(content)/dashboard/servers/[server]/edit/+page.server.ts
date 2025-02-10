import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { UpdateServerSchema as schema } from "$lib/public-zod-schemas";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
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

fs.mkdir(`storage/server-banners`, { recursive: true });
export const actions: Actions = {
    default: async (event) => {
        const { locals, params } = event;
        const { user } = locals;
        if (!user) {
            console.log("Unauthenticated.");
            error(401, { message: "Unauthenticated." });
        }

        console.log("Received POST request to edit server: ");
        const form = await superValidate(event, zod(schema));
        console.log(form.data);
        if (!form.valid) {
            console.log("Form is invalid.");
            console.log(form.errors);
            return fail(400, { form });
        }

        const { bannerFile, ...rest } = form.data;

        let bannerGood = false;
        if (bannerFile) {
            console.log("Banner file recieved.");
            console.log("Converting to buffer...");
            let aBuffer: ArrayBuffer;
            try {
                aBuffer = await bannerFile.arrayBuffer();
                console.log("Buffer converted.");
            } catch (e) {
                setError(
                    form,
                    "bannerFile",
                    "Failed to convert file to buffer.",
                );
                return fail(400, { form });
            }

            console.log("Converting to WebP...");
            let webp: Buffer;
            try {
                webp = await sharp(Buffer.from(aBuffer), {
                    animated: true,
                })
                    .toFormat("webp")
                    .toBuffer();
                console.log("WebP converted.");
            } catch (e) {
                setError(form, "bannerFile", "Failed to convert to WebP.");
                return fail(400, { form });
            }

            console.log("Writing to file...");
            try {
                await fs.writeFile(
                    `storage/server-banners/${params.server}.webp`,
                    webp,
                );
            } catch (e) {
                setError(
                    form,
                    "bannerFile",
                    "Failed to write file to disk." + e,
                );
                return fail(500, { form });
            }
            console.log("File written.");
            bannerGood = true;
        }

        try {
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
            setError(form, "name", "Failed to update server in database.");
            return fail(500, { form });
        }

        redirect(303, `/servers/${params.server}/`);
    },
};
