export type DiscordUserInfo = {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
    locale: string;
    email: string;
    verified: boolean;
};

import { db } from "$lib/server/drizzle/db";
import { userTable } from "$lib/server/drizzle/schema";

export async function updateUser(id: string, discordInfo: DiscordUserInfo) {
    return await db
        .update(userTable)
        .set({
            discordId: discordInfo.id,
            name: discordInfo.global_name,
            email: discordInfo.email,

            lastOnlineAt: new Date(),
        })
        .returning();
}
