// import type { PageServerLoad, Actions } from "./$types";
// import { db } from "$lib/server/drizzle/db";
// import { tags } from "$lib/server/drizzle/schema";
// import { eq } from "drizzle-orm";
// import { error } from "@sveltejs/kit";

// export const load = (async ({ parent }) => {
//     await parent();
//     const tagsList = await db.select().from(tags);
//     return { tags: tagsList };
// }) satisfies PageServerLoad;

// export const actions = {
//     deleteVersions: async ({ locals }) => {
//         const user = locals.user;
//         if (!user) return error(401, "You are not authenticated.");
//         // Check if user has admin role
//         if (user.role !== "admin")
//             return error(403, "You are not permitted to do that.");
//         await db.delete(tags).where(eq(tags.type, "version"));
//     },
// } satisfies Actions;
