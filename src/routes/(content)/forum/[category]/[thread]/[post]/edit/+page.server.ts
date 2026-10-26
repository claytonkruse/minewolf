import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { db } from "$lib/server/db/drizzle/db";
import {
    forumPostTable,
    forumThreadTable,
} from "$lib/server/db/drizzle/schema";
import { ForumThreadSchema } from "$lib/forum";
import { requireForumThread } from "$lib/server/forum";
import loginRedirectFrom from "$lib/utils/loginRedirectFrom";

// Title is only editable (and required) on a thread's opening post.
const EditSchema = z.object({
    title: ForumThreadSchema.shape.title.optional(),
    body: ForumThreadSchema.shape.body,
});

async function requireOwnPost(
    params: { category: string; thread: string; post: string },
    userId: string,
) {
    const { category, thread } = await requireForumThread(params);
    const postId = Number(params.post);
    const post = Number.isInteger(postId)
        ? await db.query.forumPostTable.findFirst({
              where: eq(forumPostTable.id, postId),
          })
        : undefined;
    if (!post || post.threadId !== thread.id)
        error(404, "That post doesn't exist.");
    if (post.userId !== userId) error(403, "You can only edit your own posts.");

    const firstPost = await db.query.forumPostTable.findFirst({
        columns: { id: true },
        where: eq(forumPostTable.threadId, thread.id),
        orderBy: [asc(forumPostTable.createdAt), asc(forumPostTable.id)],
    });
    return { category, thread, post, isFirstPost: firstPost?.id === post.id };
}

export const load = (async ({ locals, params, url }) => {
    const { user } = locals;
    if (!user) loginRedirectFrom(url);
    const { category, thread, post, isFirstPost } = await requireOwnPost(
        params,
        user!.id,
    );

    const form = await superValidate(
        { title: isFirstPost ? thread.title : undefined, body: post.body },
        zod(EditSchema),
    );
    return { category, thread, isFirstPost, form };
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ locals, params, request }) => {
        const { user } = locals;
        if (!user) error(401, "You must be logged in.");
        const { category, thread, post, isFirstPost } = await requireOwnPost(
            params,
            user.id,
        );

        const form = await superValidate(request, zod(EditSchema));
        if (!form.valid) return fail(400, { form });
        if (isFirstPost && !form.data.title) {
            setError(form, "title", "Title is required.");
            return fail(400, { form });
        }

        await db.transaction(async (tx) => {
            await tx
                .update(forumPostTable)
                .set({ body: form.data.body, editedAt: new Date() })
                .where(eq(forumPostTable.id, post.id));
            if (isFirstPost && form.data.title)
                await tx
                    .update(forumThreadTable)
                    .set({ title: form.data.title })
                    .where(eq(forumThreadTable.id, thread.id));
        });

        redirect(303, `/forum/${category.slug}/${thread.id}/#post-${post.id}`);
    },
} satisfies Actions;
