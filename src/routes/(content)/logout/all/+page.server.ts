import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    if (!locals.session) {
        redirect(302, "/login/");
    }
}) satisfies PageServerLoad;

import { invalidateAll } from "$lib/server/session";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ cookies, locals }) => {
        await invalidateAll(cookies, locals.session.user.id);
        redirect(302, "/login/");
    },
};
