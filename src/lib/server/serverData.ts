// // import { db } from "$lib/server/drizzle/db";
// import { servers } from "$lib/server/drizzle/schema";
// import { eq } from "drizzle-orm";
// import pingServer from "$lib/server/pingServer";
// // import { get_mc_versions } from "./mc_versions";

// async function getServer(id: number | string) {
//     id = Number(id);
//     await get_mc_versions(); // use this to automatically add version

//     let server;
//     try {
//         server = await db.query.servers.findFirst({
//             where: eq(servers.id, id),
//         });
//         if (!server) return undefined;
//     } catch (error) {
//         return undefined;
//     }

//     const pingData = await pingServer(server.ip);
//     const { online, icon, motd } = pingData;

//     let uptime = (server.uptime ?? 0) + (online ? 1 : -1);
//     if (uptime < 0) uptime = 0;
//     else if (uptime > 100) uptime = 100;

//     // const version_range = version_raw.trim().split('-');
//     // const min_version = version_range[0];
//     // const max_version = version_range[version_range.length - 1];

//     if (online) {
//         server = await db
//             .update(servers)
//             .set({
//                 online,
//                 onlinePlayers: pingData.players?.online ?? 0,
//                 maxPlayers: pingData.players?.max ?? 0,
//                 uptime,
//                 icon,
//                 cleanMotd: motd.clean.join("\n"),
//                 htmlMotd: motd.html.join("<br>"),
//             })
//             .where(eq(servers.id, id))
//             .returning()
//             .then((rows) => rows[0]);
//     } else {
//         server = await db
//             .update(servers)
//             .set({
//                 online,
//                 onlinePlayers: 0,
//                 uptime,
//             })
//             .where(eq(servers.id, id))
//             .returning()
//             .then((rows) => rows[0]);
//     }

//     return server;
// }

// export { getServer };
