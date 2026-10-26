import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db/drizzle/db";
import {
    forumPostTable,
    forumThreadTable,
} from "$lib/server/db/drizzle/schema";
import { ForumReplySchema } from "$lib/forum";
import { hasRole } from "$lib/server/roles";
import {
    POSTS_PER_PAGE,
    isPostingTooFast,
    pageParam,
    requireForumThread,
} from "$lib/server/forum";

export const load = (async ({ params, url }) => {
    const { category, thread } = await requireForumThread(params);
    const page = pageParam(url);

    const [posts, postCount] = await Promise.all([
        db.query.forumPostTable.findMany({
            where: eq(forumPostTable.threadId, thread.id),
            orderBy: [asc(forumPostTable.createdAt), asc(forumPostTable.id)],
            limit: POSTS_PER_PAGE,
            offset: (page - 1) * POSTS_PER_PAGE,
            with: {
                user: {
                    columns: { id: true, name: true },
                    with: { roles: { columns: { role: true } } },
                },
            },
        }),
        db.$count(forumPostTable, eq(forumPostTable.threadId, thread.id)),
    ]);

    const form = await superValidate(zod(ForumReplySchema));

    return {
        category,
        thread,
        posts: posts.map(({ user, ...post }) => ({
            ...post,
            author: {
                id: user.id,
                name: user.name,
                isAdmin: user.roles.some((r) => r.role === "admin"),
            },
        })),
        // id of the opening post, so the page knows deleting it removes the thread
        firstPostId: page === 1 ? posts[0]?.id : undefined,
        page,
        pageCount: Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE)),
        form,
    };
}) satisfies PageServerLoad;

function requireAdmin(locals: App.Locals) {
    if (!hasRole(locals.user, "admin"))
        error(403, "Only admins can moderate threads.");
}

export const actions = {
    reply: async ({ locals, params, request }) => {
        const { user } = locals;
        if (!user) error(401, "You must be logged in to reply.");
        const { category, thread } = await requireForumThread(params);

        const form = await superValidate(request, zod(ForumReplySchema));
        if (!form.valid) return fail(400, { form });

        if (thread.locked && !hasRole(user, "admin")) {
            setError(form, "body", "This thread is locked.");
            return fail(403, { form });
        }
        if (await isPostingTooFast(user.id)) {
            setError(form, "body", "You're posting too fast. Try again soon.");
            return fail(429, { form });
        }

        const postId = await db.transaction(async (tx) => {
            const [post] = await tx
                .insert(forumPostTable)
                .values({
                    threadId: thread.id,
                    userId: user.id,
                    body: form.data.body,
                })
                .returning({ id: forumPostTable.id });
            await tx
                .update(forumThreadTable)
                .set({ lastPostAt: new Date() })
                .where(eq(forumThreadTable.id, thread.id));
            return post.id;
        });

        const postCount = await db.$count(
            forumPostTable,
            eq(forumPostTable.threadId, thread.id),
        );
        const lastPage = Math.ceil(postCount / POSTS_PER_PAGE);
        redirect(
            303,
            `/forum/${category.slug}/${thread.id}/${lastPage > 1 ? `?page=${lastPage}` : ""}#post-${postId}`,
        );
    },

    deletePost: async ({ locals, params, request }) => {
        const { user } = locals;
        if (!user) error(401, "You must be logged in.");
        const { category, thread } = await requireForumThread(params);

        const postId = Number((await request.formData()).get("postId"));
        const post = Number.isInteger(postId)
            ? await db.query.forumPostTable.findFirst({
                  where: eq(forumPostTable.id, postId),
              })
            : undefined;
        if (!post || post.threadId !== thread.id)
            error(404, "That post doesn't exist.");
        if (post.userId !== user.id && !hasRole(user, "admin"))
            error(403, "You can only delete your own posts.");

        const firstPost = await db.query.forumPostTable.findFirst({
            columns: { id: true },
            where: eq(forumPostTable.threadId, thread.id),
            orderBy: [asc(forumPostTable.createdAt), asc(forumPostTable.id)],
        });

        // Deleting the opening post takes the whole thread with it.
        if (firstPost?.id === post.id) {
            await db
                .delete(forumThreadTable)
                .where(eq(forumThreadTable.id, thread.id));
            redirect(303, `/forum/${category.slug}/`);
        }

        await db.delete(forumPostTable).where(eq(forumPostTable.id, post.id));
        return { deleted: post.id };
    },

    togglePin: async ({ locals, params }) => {
        requireAdmin(locals);
        const { thread } = await requireForumThread(params);
        await db
            .update(forumThreadTable)
            .set({ pinned: !thread.pinned })
            .where(eq(forumThreadTable.id, thread.id));
    },

    toggleLock: async ({ locals, params }) => {
        requireAdmin(locals);
        const { thread } = await requireForumThread(params);
        await db
            .update(forumThreadTable)
            .set({ locked: !thread.locked })
            .where(eq(forumThreadTable.id, thread.id));
    },
} satisfies Actions;
