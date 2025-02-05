// import { db } from "$lib/server/drizzle/db";
// // import { versions, tags } from "$lib/server/drizzle/schema";
// import cache from "./cache";

// type Version = { id: string; type: string };

// async function get_mc_versions() {
//     const db_versions = await db.select().from(versions);

//     const reqUrl =
//         "https://launchermeta.mojang.com/mc/game/version_manifest.json";
//     const cached = cache.get(reqUrl);
//     let response;
//     if (cached) response = cached;
//     else {
//         response = await (await fetch(reqUrl)).json();
//         cache.set(reqUrl, response, 6000);
//     }

//     const manifest: {
//         latest: {
//             release: string;
//             snapshot: string;
//         };
//         versions: Array<{
//             id: string;
//             type: string;
//             url: string;
//             time: string;
//             releaseTime: string;
//         }>;
//     } = response;
//     const manifest_versions = manifest.versions.toReversed();
//     let versions_list: Array<Version> = [];
//     let new_versions: Array<Version> = [];
//     for (const manifest_version of manifest_versions) {
//         const { id, type } = manifest_version;
//         const version: Version = { id, type };
//         versions_list = [...versions_list, version];

//         if (db_versions.every((db_version) => db_version.id !== version.id)) {
//             new_versions = [...new_versions, version];
//         }
//     }

//     // Add new versions to database
//     for (const version of new_versions) {
//         console.log("Found new version; adding to database.");
//         const [tag] = await db
//             .insert(tags)
//             .values({
//                 type: "version",
//                 name: version.id,
//             })
//             .returning();

//         if (tag) {
//             await db
//                 .insert(versions)
//                 .values({ ...version, tagId: tag.id })
//                 .catch(() => "");
//         }
//     }

//     return versions_list;
// }

// export { get_mc_versions };
