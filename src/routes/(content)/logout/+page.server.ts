import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    if (!locals.session) {
        redirect(302, "/login/");
    }
}) satisfies PageServerLoad;

import { invalidateSession } from "$lib/server/session";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ cookies }) => {
        await invalidateSession(cookies);
        redirect(302, "/login/");
    },
};
