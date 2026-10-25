import type { PageServerLoad } from "./$types";
import loginRedirectFrom from "$lib/utils/loginRedirectFrom";
import { hasRole } from "$lib/server/roles";

export const load = (async ({ locals, url }) => {
    const { user } = locals;
    if (!user) loginRedirectFrom(url);
    return { user, isAdmin: hasRole(user, "admin") };
}) satisfies PageServerLoad;
