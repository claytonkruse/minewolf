import { userTable } from "$lib/server/db/drizzle/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { updateUser } from "$lib/server/db/api/updateUser";
import { createSession, updateSessionCookie } from "$lib/server/session";
import { db } from "$lib/server/db/drizzle/db";
import { eq } from "drizzle-orm";

import { discord } from "$lib/server/authProviders";
import { getDiscordInfo } from "$lib/server/getDiscordInfo";
import { randomUUID } from "node:crypto";
import { final_url } from "$lib/utils/redirect_urls";
import localize_url from "$lib/utils/localize_url";

export const load = (async ({ locals, url, cookies }) => {
    let destination = final_url(url);
    destination =
        !destination || destination === "/"
            ? localize_url(cookies.get("login-to"))
            : destination;
    if (destination) {
        cookies.set("login-to", destination, {
            httpOnly: true,

            secure: false,
            path: "/",
            sameSite: "lax",
            maxAge: 60,
        });
    } else {
        destination = "/dashboard/";
    }

    if (locals.user) {
        redirect(302, destination);
    }

    const code = url.searchParams.get("code");
    if (!code) return {};

    const tokens = await discord.validateAuthorizationCode(code, null);
    const accessToken = tokens.accessToken();
    const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
    const refreshToken = tokens.refreshToken();

    const discordInfo = await getDiscordInfo(accessToken);

    if (!(discordInfo.email && discordInfo.verified)) {
        error(400, "Your Discord account must have a verified email.");
    }

    let user = await db.query.userTable.findFirst({
        where: eq(userTable.discordId, discordInfo.id),
    });

    if (user) {
        updateUser(user.id, discordInfo); // does not need an await
    } else {
        try {
            [user] = await db
                .insert(userTable)

                .values({
                    id: randomUUID(),

                    discordId: discordInfo.id,
                    name: discordInfo.global_name,
                    email: discordInfo.email,

                    createdAt: new Date(),
                    lastOnlineAt: new Date(),
                })
                .returning();
        } catch (err) {
            error(500, "Error while adding user to the database.");
        }
    }

    const token = await createSession(
        user.id,
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
    );

    if (!token) error(500, "Error while adding session to the database.");

    updateSessionCookie(cookies, token, accessTokenExpiresAt);
    redirect(302, destination);
}) satisfies PageServerLoad;
