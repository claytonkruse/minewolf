import { discord } from "$lib/server/AuthProviders";
import { db } from "$lib/server/drizzle/db";
import { sessions } from "$lib/server/drizzle/schema";
import { getDiscordInfo } from "$lib/server/getDiscordInfo";
import { updateSessionCookie } from "$lib/server/updateSessionCookie";
import { updateUser } from "$lib/server/updateUser";
import type { Handle } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const handle: Handle = async ({ event, resolve }) => {
    const { cookies } = event;
    const sessionId = cookies.get("session");

    if (!sessionId) return await resolve(event);
    let session;
    try {
        session = await db.query.sessions.findFirst({
            where: eq(sessions.id, sessionId),
            with: { user: true },
        });
    } catch (e) {
        console.log("Failed to find session in database. Removing cookie.");
        cookies.delete("session", { path: "/" });
        return await resolve(event);
    }

    if (!session) return await resolve(event);
    event.locals.session = session;
    const { user } = session;
    event.locals.user = user;

    if (
        new Date() <
        new Date(
            session.discordAccessTokenExpiresAt.getTime() - 1000 * 60 * 60 * 24,
        )
    )
        return await resolve(event);

    let tokens;
    try {
        tokens = await discord.refreshAccessToken(session.discordRefreshToken);
    } catch (e) {
        console.log("Failed to refresh access token. Aborting refresh.");
        return await resolve(event);
    }
    const accessToken = tokens.accessToken();
    const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
    const refreshToken = tokens.refreshToken();

    try {
        await db
            .update(sessions)
            .set({
                discordAccessToken: accessToken,
                discordAccessTokenExpiresAt: accessTokenExpiresAt,
                discordRefreshToken: refreshToken,
            })
            .where(eq(sessions.id, session.id));
    } catch (e) {
        console.log("Failed to update session in database. Aborting refresh.");
        return await resolve(event);
    }

    updateSessionCookie(cookies, session.id, accessTokenExpiresAt);
    getDiscordInfo(accessToken).then((discordInfo) =>
        updateUser(user.id, discordInfo),
    );

    return await resolve(event);
};
