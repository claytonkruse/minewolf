import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { findServers, parseFilters } from "$lib/server/serverFilters";

// Sends the visitor to a random server matching the same search and filters
// as /servers/ (online servers only by default), across all result pages.
// With no matches, goes back to the empty search results.
export const GET: RequestHandler = async ({ url }) => {
    const servers = await findServers(parseFilters(url.searchParams));
    if (servers.length === 0) redirect(303, `/servers/${url.search}`);
    const server = servers[Math.floor(Math.random() * servers.length)];
    redirect(303, `/servers/${server.id}/`);
};
