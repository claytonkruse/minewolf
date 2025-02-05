import { sessions, users } from "$lib/server/drizzle/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { updateUser } from "$lib/server/updateUser";
import { updateSessionCookie } from "$lib/server/updateSessionCookie";
import { db } from "$lib/server/drizzle/db";
import { eq } from "drizzle-orm";
import { discord } from "$lib/server/AuthProviders";
import { getDiscordInfo } from "$lib/server/getDiscordInfo";
import { randomUUID } from "node:crypto";

export const load = (async ({ locals, url, cookies }) => {
    if (locals.user) {
        redirect(302, "/dashboard/");
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

    let user = await db.query.users
        .findFirst({
            where: eq(users.discordId, discordInfo.id),
        })
        .catch();

    if (user) {
        updateUser(user.id, discordInfo); // does not need an await
    } else {
        try {
            [user] = await db
                .insert(users)

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

    let session;
    try {
        [session] = await db
            .insert(sessions)
            .values({
                id: randomUUID(),

                userId: user.id,
                discordAccessToken: accessToken,
                discordAccessTokenExpiresAt: accessTokenExpiresAt,
                discordRefreshToken: refreshToken,
            })
            .returning();
    } catch (err) {
        console.error(err);
        error(500, "Error while adding session to the database.");
    }

    if (!session) error(500, "Error while adding session to the database.");

    updateSessionCookie(cookies, session.id, accessTokenExpiresAt);

    redirect(302, "/dashboard/");
}) satisfies PageServerLoad;
