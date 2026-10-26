import type { PageServerLoad } from "./$types";
import { asc, count, desc, eq, max, sql } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import {
    forumPostTable,
    forumThreadTable,
    userTable,
} from "$lib/server/db/drizzle/schema";
import { FORUM_RULES_THREAD_ID, forumCategories } from "$lib/forum";

const SIDEBAR_THREADS = 10;

export const load = (async () => {
    // When a post was created or last edited, whichever is later.
    const activityAt = sql<Date>`greatest(${forumPostTable.createdAt}, coalesce(${forumPostTable.editedAt}, ${forumPostTable.createdAt}))`;

    const [stats, topThreads, recentPosts, rules, rulesPostCount] =
        await Promise.all([
            db
                .select({
                    category: forumThreadTable.category,
                    threadCount: count(),
                    lastPostAt: max(forumThreadTable.lastPostAt),
                })
                .from(forumThreadTable)
                .groupBy(forumThreadTable.category),
            db
                .select({
                    id: forumThreadTable.id,
                    category: forumThreadTable.category,
                    title: forumThreadTable.title,
                    views: forumThreadTable.views,
                    authorName: userTable.name,
                })
                .from(forumThreadTable)
                .innerJoin(userTable, eq(forumThreadTable.userId, userTable.id))
                .orderBy(
                    desc(forumThreadTable.views),
                    desc(forumThreadTable.lastPostAt),
                )
                .limit(8),
            db
                .select({
                    postId: forumPostTable.id,
                    threadId: forumThreadTable.id,
                    category: forumThreadTable.category,
                    title: forumThreadTable.title,
                    authorName: userTable.name,
                    activityAt: activityAt.mapWith(forumPostTable.createdAt),
                    edited: sql<boolean>`${forumPostTable.editedAt} is not null`,
                    isFirstPost: sql<boolean>`${forumPostTable.id} = (select min(fp.id) from ${forumPostTable} fp where fp.thread_id = ${forumThreadTable.id})`,
                })
                .from(forumPostTable)
                .innerJoin(
                    forumThreadTable,
                    eq(forumPostTable.threadId, forumThreadTable.id),
                )
                .innerJoin(userTable, eq(forumPostTable.userId, userTable.id))
                .orderBy(desc(activityAt))
                // Over-fetch, then keep each thread's latest activity only.
                .limit(SIDEBAR_THREADS * 4),
            db.query.forumThreadTable.findFirst({
                columns: { id: true, category: true, title: true },
                where: eq(forumThreadTable.id, FORUM_RULES_THREAD_ID),
                with: {
                    posts: {
                        columns: {
                            id: true,
                            body: true,
                            createdAt: true,
                            editedAt: true,
                        },
                        orderBy: [
                            asc(forumPostTable.createdAt),
                            asc(forumPostTable.id),
                        ],
                        limit: 1,
                        with: {
                            user: {
                                columns: { name: true },
                                with: { roles: { columns: { role: true } } },
                            },
                        },
                    },
                },
            }),
            db.$count(
                forumPostTable,
                eq(forumPostTable.threadId, FORUM_RULES_THREAD_ID),
            ),
        ]);

    const seenThreads = new Set<number>();
    const recentActivity = recentPosts
        .filter(({ threadId }) => {
            if (seenThreads.has(threadId)) return false;
            seenThreads.add(threadId);
            return true;
        })
        .slice(0, SIDEBAR_THREADS)
        .map(({ edited, isFirstPost, ...post }) => ({
            ...post,
            kind: edited
                ? ("Updated" as const)
                : isFirstPost
                  ? ("New thread" as const)
                  : ("Reply" as const),
        }));

    const categories = forumCategories.map((category) => {
        const stat = stats.find((s) => s.category === category.slug);
        return {
            ...category,
            threadCount: stat?.threadCount ?? 0,
            lastPostAt: stat?.lastPostAt ?? null,
        };
    });

    const firstRulesPost = rules?.posts[0];
    const rulesPost =
        rules && firstRulesPost
            ? {
                  threadId: rules.id,
                  category: rules.category,
                  title: rules.title,
                  replyCount: Math.max(0, rulesPostCount - 1),
                  post: {
                      id: firstRulesPost.id,
                      body: firstRulesPost.body,
                      createdAt: firstRulesPost.createdAt,
                      editedAt: firstRulesPost.editedAt,
                      author: {
                          name: firstRulesPost.user.name,
                          isAdmin: firstRulesPost.user.roles.some(
                              (r) => r.role === "admin",
                          ),
                      },
                  },
              }
            : null;

    return { categories, topThreads, recentActivity, rulesPost };
}) satisfies PageServerLoad;
