import type { LayoutServerLoad } from "./$types";
import loginRedirectFrom from "$lib/utils/loginRedirectFrom";

export const load = (async ({ locals, url }) => {
    if (!locals.user) throw loginRedirectFrom(url);
    return {};
}) satisfies LayoutServerLoad;
