// import type { RequestHandler } from "./$types";
// import { getServer } from "$lib/server/serverData";
// import { error } from "@sveltejs/kit";

// export const GET: RequestHandler = async ({ params }) => {
//     const { id } = params;
//     const server = await getServer(id);
//     if (!server) throw error(404, "Server does not exist.");
//     if (!server.icon) throw error(404, "Icon not found.");
//     return await fetch(server.icon);
// };
