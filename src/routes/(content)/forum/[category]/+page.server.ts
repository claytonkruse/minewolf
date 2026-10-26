import type { PageServerLoad } from "./$types";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import {
    forumPostTable,
    forumThreadTable,
    userTable,
} from "$lib/server/db/drizzle/schema";
import {
    THREADS_PER_PAGE,
    pageParam,
    requireForumCategory,
} from "$lib/server/forum";

export const load = (async ({ params, url }) => {
    const category = requireForumCategory(params.category);
    const page = pageParam(url);
    const inCategory = eq(forumThreadTable.category, category.slug);

    const [threads, threadCount] = await Promise.all([
        db
            .select({
                id: forumThreadTable.id,
                title: forumThreadTable.title,
                pinned: forumThreadTable.pinned,
                locked: forumThreadTable.locked,
                createdAt: forumThreadTable.createdAt,
                lastPostAt: forumThreadTable.lastPostAt,
                authorName: userTable.name,
                replyCount:
                    sql<number>`(select count(*) - 1 from ${forumPostTable} where ${forumPostTable.threadId} = ${forumThreadTable.id})`.mapWith(
                        Number,
                    ),
            })
            .from(forumThreadTable)
            .innerJoin(userTable, eq(forumThreadTable.userId, userTable.id))
            .where(inCategory)
            .orderBy(
                desc(forumThreadTable.pinned),
                desc(forumThreadTable.lastPostAt),
            )
            .limit(THREADS_PER_PAGE)
            .offset((page - 1) * THREADS_PER_PAGE),
        db.$count(forumThreadTable, inCategory),
    ]);

    return {
        category,
        threads,
        page,
        pageCount: Math.max(1, Math.ceil(threadCount / THREADS_PER_PAGE)),
    };
}) satisfies PageServerLoad;
