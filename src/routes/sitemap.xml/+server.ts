import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { forumThreadTable, serverTable } from "$lib/server/db/drizzle/schema";
import { forumCategories } from "$lib/forum";
import { SITE_URL } from "$lib/config";

const staticPages = [
    "/",
    "/servers/",
    "/forum/",
    "/add-server/",
    "/sponsor/",
    "/about/",
    "/discord/",
];

function entry(path: string, lastmod?: Date) {
    const lastmodTag = lastmod
        ? `<lastmod>${lastmod.toISOString()}</lastmod>`
        : "";
    return `<url><loc>${SITE_URL}${path}</loc>${lastmodTag}</url>`;
}

export const GET: RequestHandler = async () => {
    const [servers, threads] = await Promise.all([
        db.select({ id: serverTable.id }).from(serverTable),
        db
            .select({
                id: forumThreadTable.id,
                category: forumThreadTable.category,
                lastPostAt: forumThreadTable.lastPostAt,
            })
            .from(forumThreadTable),
    ]);

    const urls = [
        ...staticPages.map((path) => entry(path)),
        ...forumCategories.map(({ slug }) => entry(`/forum/${slug}/`)),
        ...servers.map(({ id }) => entry(`/servers/${id}/`)),
        // Threads in a renamed or removed category 404, so leave them out.
        ...threads
            .filter(({ category }) =>
                forumCategories.some(({ slug }) => slug === category),
            )
            .map(({ id, category, lastPostAt }) =>
                entry(`/forum/${category}/${id}/`, lastPostAt),
            ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
        },
    });
};
