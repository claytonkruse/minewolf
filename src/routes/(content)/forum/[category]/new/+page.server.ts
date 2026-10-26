import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { db } from "$lib/server/db/drizzle/db";
import {
    forumPostTable,
    forumThreadTable,
} from "$lib/server/db/drizzle/schema";
import { ForumThreadSchema } from "$lib/forum";
import { isPostingTooFast, requireForumCategory } from "$lib/server/forum";
import { TurnstileSchema } from "$lib/server/private-zod-schemas";
import loginRedirectFrom from "$lib/utils/loginRedirectFrom";

const PublicSchema = z.object({
    "cf-turnstile-response": z
        .string({ required_error: "CAPTCHA error." })
        .nonempty("CAPTCHA error."),
    ...ForumThreadSchema.shape,
});

export const load = (async ({ locals, params, url }) => {
    if (!locals.user) loginRedirectFrom(url);
    const category = requireForumCategory(params.category);

    const form = await superValidate(zod(PublicSchema));
    return { category, form };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ locals, params, request }) => {
        const { user } = locals;
        if (!user) error(401, "You must be logged in to post.");
        const category = requireForumCategory(params.category);

        const form = await superValidate(request, zod(PublicSchema));
        if (!form.valid) return fail(400, { form });

        const turnstileParse = await TurnstileSchema.safeParseAsync(
            form.data["cf-turnstile-response"],
        );
        if (!turnstileParse.success) {
            setError(form, "cf-turnstile-response", "CAPTCHA error.");
            return fail(400, { form });
        }

        if (await isPostingTooFast(user.id)) {
            setError(form, "body", "You're posting too fast. Try again soon.");
            return fail(429, { form });
        }

        const { title, body } = form.data;
        const threadId = await db.transaction(async (tx) => {
            const [thread] = await tx
                .insert(forumThreadTable)
                .values({ userId: user.id, category: category.slug, title })
                .returning({ id: forumThreadTable.id });
            await tx
                .insert(forumPostTable)
                .values({ threadId: thread.id, userId: user.id, body });
            return thread.id;
        });

        redirect(303, `/forum/${category.slug}/${threadId}/`);
    },
} satisfies Actions;
