import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({ parent, locals }) => {
    await parent();
    if (locals.user.role !== "admin")
        return error(403, "You are not authorized to access the admin panel.");
    return {};
}) satisfies LayoutServerLoad;
