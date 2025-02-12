export type DiscordUserInfo = {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
    locale: string;
    email: string;
    verified: boolean;
};

import { db } from "$lib/server/db/drizzle/db";
import { userTable } from "$lib/server/db/drizzle/schema";
import { eq } from "drizzle-orm";

export async function updateUser(id: string, discordInfo: DiscordUserInfo) {
    let user;
    try {
        user = await db
            .update(userTable)
            .set({
                name: discordInfo.global_name,
                email: discordInfo.email,

                lastOnlineAt: new Date(),
            })
            .where(eq(userTable.id, id))
            .returning();
    } catch (err) {
        console.error(
            `Error while updating user. ${id} (${discordInfo.global_name})`,
        );
        throw err;
    }
    return user;
}
