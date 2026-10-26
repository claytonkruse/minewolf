import { env } from "$env/dynamic/private";
import type { Server } from "$lib/server/db/drizzle/schema";

// Posts notifications to a Discord channel through the bot REST API.
// Optional: does nothing unless DISCORD_BOT_TOKEN and
// DISCORD_NOTIFY_CHANNEL_ID are set. The bot needs the "Send Messages" and
// "Embed Links" permissions in that channel.

const ACCENT_COLOR = 0xf59e0b;

type Embed = {
    title: string;
    url: string;
    description?: string;
    color?: number;
    thumbnail?: { url: string };
    fields?: { name: string; value: string; inline?: boolean }[];
    timestamp?: string;
};

async function sendEmbed(embed: Embed) {
    const token = env.DISCORD_BOT_TOKEN;
    const channelId = env.DISCORD_NOTIFY_CHANNEL_ID;
    if (!token || !channelId) return;

    try {
        const res = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bot ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    embeds: [embed],
                    // user-supplied text must never ping anyone
                    allowed_mentions: { parse: [] },
                }),
            },
        );
        if (!res.ok) {
            console.error(
                `Discord notification failed: ${res.status} ${await res.text()}`,
            );
        }
    } catch (e) {
        console.error("Discord notification failed:", e);
    }
}

// Discord only renders http(s) thumbnails, not the data: URIs servers send.
function thumbnail(server: Server) {
    return server.iconUrl.startsWith("http")
        ? { url: server.iconUrl }
        : undefined;
}

function escapeMarkdown(text: string) {
    return text.replace(/[\\*_~`|>#[\]()-]/g, "\\$&");
}

export function notifyServerAdded(server: Server, origin: string) {
    const fields: Embed["fields"] = [];
    if (!server.addressPrivate) {
        const address =
            server.port === 25565
                ? server.address
                : `${server.address}:${server.port}`;
        fields.push({ name: "Address", value: `\`${address}\``, inline: true });
    }
    fields.push({ name: "Version", value: server.versionString, inline: true });

    return sendEmbed({
        title: `New server: ${server.name}`,
        url: `${origin}/servers/${server.id}/`,
        color: ACCENT_COLOR,
        thumbnail: thumbnail(server),
        fields,
        timestamp: new Date().toISOString(),
    });
}

export function notifyVote(server: Server, username: string, origin: string) {
    return sendEmbed({
        title: `Vote for ${server.name}`,
        url: `${origin}/servers/${server.id}/`,
        description: `**${escapeMarkdown(username)}** voted for this server.`,
        color: ACCENT_COLOR,
        thumbnail: thumbnail(server),
        timestamp: new Date().toISOString(),
    });
}
