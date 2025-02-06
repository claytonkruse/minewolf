import type { Handle } from "@sveltejs/kit";
import { validateSession } from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
    const { cookies } = event;
    const session = await validateSession(cookies);
    if (!session) return await resolve(event);
    const { user } = session;

    event.locals.session = session;
    event.locals.user = user;

    return await resolve(event);
};
