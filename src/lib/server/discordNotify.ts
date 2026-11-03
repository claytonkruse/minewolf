import { env } from "$env/dynamic/private";
import type { Server } from "$lib/server/db/drizzle/schema";
import { plainText, truncate } from "$lib/utils/plainText";
import { createHash } from "node:crypto";

// Posts notifications to a Discord channel through the bot REST API.
// Optional: does nothing unless DISCORD_BOT_TOKEN and
// DISCORD_NOTIFY_CHANNEL_ID are set. The bot needs the "Send Messages" and
// "Embed Links" permissions in that channel.

const ACCENT_COLOR = 0xf59e0b;

type Embed = {
    title: string;
    url?: string;
    description?: string;
    color?: number;
    thumbnail?: { url: string };
    image?: { url: string };
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

// Discord only renders http(s) images, not the data: URIs servers send, so
// point it at /servers/<id>/icon.png. The hash busts Discord's image cache
// when the icon changes.
function thumbnail(server: Server, origin: string) {
    if (server.iconUrl.startsWith("http")) return { url: server.iconUrl };
    if (!server.iconUrl.startsWith("data:image/png;base64,")) return undefined;
    const hash = createHash("sha1")
        .update(server.iconUrl)
        .digest("hex")
        .slice(0, 8);
    return { url: `${origin}/servers/${server.id}/icon.png?v=${hash}` };
}

// The Minecraft server list widget as a PNG. Timestamped so Discord fetches
// it fresh and shows the server as it was at the time of the vote.
function widgetImage(server: Server, origin: string) {
    return { url: `${origin}/servers/${server.id}/widget.png?v=${Date.now()}` };
}

// bannerUrl is a site-relative path like /servers/1/banner.webp?v=123.
function banner(server: Server, origin: string) {
    return server.bannerUrl ? { url: origin + server.bannerUrl } : undefined;
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
        thumbnail: thumbnail(server, origin),
        fields,
        timestamp: new Date().toISOString(),
    });
}

export function notifyVote(server: Server, username: string, origin: string) {
    let description = `**${escapeMarkdown(username)}** voted for this server.`;
    const about = truncate(plainText(server.description), 300);
    if (about) description += `\n\n${escapeMarkdown(about)}`;

    const fields: Embed["fields"] = [
        {
            name: "Players",
            value: server.online
                ? `${server.onlinePlayers} / ${server.maxPlayers}`
                : "Offline",
            inline: true,
        },
    ];
    // Last field, so it sits under everything except the large image, which
    // Discord always draws below the fields.
    fields.push({
        name: "\u200b",
        value: `[View server](${origin}/servers/${server.id}/)`,
    });

    return sendEmbed({
        title: `Vote for ${server.name}`,
        description,
        color: ACCENT_COLOR,
        thumbnail: thumbnail(server, origin),
        // The banner if the server has one, otherwise the server list widget
        // image, which shows the MOTD.
        image: banner(server, origin) ?? widgetImage(server, origin),
        fields,
        timestamp: new Date().toISOString(),
    });
}
