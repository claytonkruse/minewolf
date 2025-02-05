import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    if (!locals.session) {
        redirect(302, "/login/");
    }
}) satisfies PageServerLoad;

import { db } from "$lib/server/drizzle/db";
import { eq } from "drizzle-orm";
import { sessions } from "$lib/server/drizzle/schema";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ locals, cookies }) => {
        db.delete(sessions).where(eq(sessions.id, locals.session?.id));
        cookies.delete("session", { path: "/" });
        redirect(302, "/login/");
    },
};
