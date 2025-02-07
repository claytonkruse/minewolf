import { eq } from "drizzle-orm";
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Cookies } from "@sveltejs/kit";
import { sessionTable } from "$lib/server/db/drizzle/schema";
import { db } from "$lib/server/db/drizzle/db";
import { discord } from "./authProviders";
import { getDiscordInfo } from "$lib/server/getDiscordInfo";
import { updateUser } from "$lib/server/db/api/updateUser";

const COOKIE_NAME = "session_token";

export function updateSessionCookie(
    cookies: Cookies,
    sessionId: string,
    accessTokenExpiresAt: Date,
) {
    cookies.set(COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: accessTokenExpiresAt,
        path: "/",
    });
}

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

function getId(token: string) {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );
    return sessionId;
}

export async function createSession(
    userId: string,
    discordAccessToken: string,
    discordAccessTokenExpiresAt: Date,
    discordRefreshToken: string,
): Promise<string> {
    const token = generateSessionToken();
    const sessionId = getId(token);

    const session = {
        id: sessionId,
        userId,
        discordAccessToken,
        discordAccessTokenExpiresAt,
        discordRefreshToken,
    };
    await db.insert(sessionTable).values(session);

    return token;
}

export async function validateSession(cookies: Cookies) {
    const token = cookies.get(COOKIE_NAME);
    if (!token) return null;
    const sessionId = getId(token);
    let session;
    try {
        session = await db.query.sessionTable.findFirst({
            where: eq(sessionTable.id, sessionId),
            with: { user: true },
        });
    } catch (e) {
        console.log("Failed to find session in database. Removing cookie.");
        cookies.delete(COOKIE_NAME, { path: "/" });
        return null;
    }
    if (!session) return null;
    const { user } = session;

    if (new Date() > session.discordAccessTokenExpiresAt) return null;

    if (
        new Date() >
        new Date(
            session.discordAccessTokenExpiresAt.getTime() - 1000 * 60 * 60 * 24,
        )
    ) {
        let tokens;
        try {
            tokens = await discord.refreshAccessToken(
                session.discordRefreshToken,
            );
        } catch (e) {
            console.log("Failed to refresh access token. Aborting refresh.");
            return null;
        }
        const accessToken = tokens.accessToken();
        const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
        const refreshToken = tokens.refreshToken();

        try {
            await db
                .update(sessionTable)
                .set({
                    discordAccessToken: accessToken,
                    discordAccessTokenExpiresAt: accessTokenExpiresAt,
                    discordRefreshToken: refreshToken,
                })
                .where(eq(sessionTable.id, session.id));
        } catch (e) {
            console.log(
                "Failed to update session in database. Aborting refresh.",
            );
            return null;
        }

        updateSessionCookie(cookies, session.id, accessTokenExpiresAt);
        getDiscordInfo(accessToken).then((discordInfo) =>
            updateUser(user.id, discordInfo),
        );
    }

    return session;
}

export async function invalidateSession(cookies: Cookies) {
    const token = cookies.get(COOKIE_NAME);
    if (!token) return;
    const sessionId = getId(token);
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
    cookies.delete(COOKIE_NAME, { path: "/" });
}
