import { z } from "zod";

// Add or reorder categories here; threads store the slug, so renaming a
// slug orphans its threads.
export const forumCategories = [
    {
        slug: "general",
        name: "General",
        description: "Talk about anything Minecraft.",
    },
    {
        slug: "servers",
        name: "Servers",
        description: "Find servers, share your server.",
    },
    {
        slug: "bedrock-servers",
        name: "Bedrock Servers",
        description: "Find a Bedrock server.",
    },
    {
        slug: "modded-servers",
        name: "Modded Servers",
        description: "Find and share modded servers and modpacks.",
    },
    {
        slug: "realms",
        name: "Realms",
        description: "Share your Realm.",
    },
    {
        slug: "builds",
        name: "Builds",
        description: "Show off your Minecraft builds.",
    },
    {
        slug: "lfg",
        name: "LFG",
        description: "Looking for a group to join on a server.",
    },
    {
        slug: "server-owners",
        name: "Server Owners",
        description: "Grow, run, and promote your Minecraft server.",
    },
    {
        slug: "recruiting",
        name: "Recruiting",
        description: "Recruit server staff or offer your services to servers.",
    },
] as const;
export type ForumCategory = (typeof forumCategories)[number];

// Shown on the forum home page; if the thread is deleted the panel is hidden.
export const FORUM_RULES_THREAD_ID = 2;

export function getForumCategory(slug: string) {
    return forumCategories.find((c) => c.slug === slug);
}

export const ForumPostBodySchema = z
    .string({ required_error: "Write something first." })
    .trim()
    .min(2, { message: "Posts must be at least 2 characters." })
    .max(10000, { message: "Posts must be less than 10,000 characters." });

export const ForumReplySchema = z.object({
    body: ForumPostBodySchema,
});

export const ForumThreadSchema = z.object({
    title: z
        .string({ required_error: "Title is required." })
        .trim()
        .min(4, { message: "Titles must be at least 4 characters." })
        .max(120, { message: "Titles must be less than 120 characters." }),
    body: ForumPostBodySchema,
});
