import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { hasRole } from "$lib/server/roles";
import loginRedirectFrom from "$lib/utils/loginRedirectFrom";

export const load = (async ({ locals, url }) => {
    const { user } = locals;
    if (!user) loginRedirectFrom(url);
    if (!hasRole(user, "admin"))
        error(403, "You are not authorized to access the admin dashboard.");
    return {};
}) satisfies LayoutServerLoad;
