import type { Cookies } from "@sveltejs/kit";

export function updateSessionCookie(
    cookies: Cookies,
    sessionId: string,
    accessTokenExpiresAt: Date,
) {
    cookies.set("session", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: accessTokenExpiresAt,
        path: "/",
    });
}
