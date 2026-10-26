import { error } from "@sveltejs/kit";
import { and, eq, gt } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import {
    forumPostTable,
    forumThreadTable,
} from "$lib/server/db/drizzle/schema";
import { getForumCategory } from "$lib/forum";

export const THREADS_PER_PAGE = 25;
export const POSTS_PER_PAGE = 20;
// Minimum time between two posts by the same user.
const POST_COOLDOWN_MS = 1000 * 15;

export function requireForumCategory(slug: string) {
    const category = getForumCategory(slug);
    if (!category) error(404, "That forum category doesn't exist.");
    return category;
}

// 404s unless the thread exists and lives in the category from the URL.
export async function requireForumThread(params: {
    category: string;
    thread: string;
}) {
    const category = requireForumCategory(params.category);
    const threadId = Number(params.thread);
    const thread = Number.isInteger(threadId)
        ? await db.query.forumThreadTable.findFirst({
              where: eq(forumThreadTable.id, threadId),
          })
        : undefined;
    if (!thread || thread.category !== category.slug)
        error(404, "That thread doesn't exist.");
    return { category, thread };
}

export async function isPostingTooFast(userId: string) {
    const recent = await db.query.forumPostTable.findFirst({
        columns: { id: true },
        where: and(
            eq(forumPostTable.userId, userId),
            gt(
                forumPostTable.createdAt,
                new Date(Date.now() - POST_COOLDOWN_MS),
            ),
        ),
    });
    return !!recent;
}

export function pageParam(url: URL) {
    const page = Number(url.searchParams.get("page") ?? 1);
    return Number.isInteger(page) && page > 0 ? page : 1;
}
