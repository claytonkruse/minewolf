import type { LayoutServerLoad } from "./$types";
import { hasRole } from "$lib/server/roles";

export const load = (async ({ locals }) => {
    const { user } = locals;
    return { user, isAdmin: hasRole(user, "admin") };
}) satisfies LayoutServerLoad;
