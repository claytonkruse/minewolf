import type { RequestHandler } from "./$types";
import { SITE_URL } from "$lib/config";

// Account pages and the API are behind login, and search results are endless
// near-duplicates. Everything else that shouldn't be indexed (login, vote,
// forms) stays crawlable so crawlers can see its noindex tag.
const robots = `User-agent: *
Disallow: /api/
Disallow: /dashboard/
Disallow: /servers/?name=

Sitemap: ${SITE_URL}/sitemap.xml
`;

export const GET: RequestHandler = () =>
    new Response(robots, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
        },
    });
