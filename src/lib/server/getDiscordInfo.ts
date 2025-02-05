export async function getDiscordInfo(accessToken: string) {
    const discordInfo = await (
        await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
    ).json();

    return discordInfo;
}
