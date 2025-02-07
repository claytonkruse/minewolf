import type { PageServerLoad } from "./$types";
import loginRedirectFrom from "$lib/utils/loginRedirectFrom";

export const load = (async ({ locals, url }) => {
    const { user } = locals;
    if (!user) loginRedirectFrom(url);
    return { user };
}) satisfies PageServerLoad;
