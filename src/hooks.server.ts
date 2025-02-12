import type { Handle } from "@sveltejs/kit";
import { validateSession } from "$lib/server/session";

let requestCount = 0;

export const handle: Handle = async ({ event, resolve }) => {
    requestCount++;
    console.log(`Req: ${requestCount}`);
    console.log(event.request);
    const { cookies } = event;
    const session = await validateSession(cookies);
    if (!session) return await resolve(event);
    const { user } = session;

    event.locals.session = session;
    event.locals.user = user;

    return await resolve(event);
};
