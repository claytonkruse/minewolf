import type { Actions } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { userTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";
import { error, redirect } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ locals }) => {
        await db
            .delete(userTable)
            .where(eq(userTable.id, locals.user.id))
            .catch((e) =>
                error(500, "Error while deleting account from the database."),
            );

        redirect(302, "./success/");
    },
};
