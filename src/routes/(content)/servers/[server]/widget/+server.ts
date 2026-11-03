import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
// Monocraft (OFL, see monocraft-OFL.txt), with its coding ligatures removed
// so "->" in an MOTD stays two characters, like in-game.
import fontUrl from "$lib/assets/fonts/monocraft.woff2?url";
import noIconUrl from "$lib/assets/pack.png?url";
// Minecraft's menu background (textures/gui/options_background.png, 1.8.9).
import dirtUrl from "$lib/assets/dirt.png?url";
import logoUrl from "$lib/assets/logo.png?url";
import interUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import oxaniumUrl from "@fontsource-variable/oxanium/files/oxanium-latin-wght-normal.woff2?url";

// Embeddable widget for a server. Plain HTML (no SvelteKit runtime) so it
// stays light inside an iframe. Owners embed it with the snippet on the server
// page. ?theme= picks the look:
//   minecraft (default)  Minecraft multiplayer list entry on the menu dirt
//   basic                the same entry on a plain dark background
//   minewolf        the site's own card style

export const trailingSlash = "always";

function escapeHtml(text: string) {
    return text.replace(
        /[&<>"']/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[c]!,
    );
}

const THEMES = ["minecraft", "basic", "minewolf"] as const;
type WidgetTheme = (typeof THEMES)[number];

function getTheme(url: URL): WidgetTheme {
    const theme = url.searchParams.get("theme");
    if (THEMES.includes(theme as WidgetTheme)) return theme as WidgetTheme;
    // Older snippets used ?theme=plain or ?bg=plain for the basic theme.
    if (theme === "plain" || url.searchParams.get("bg") === "plain")
        return "basic";
    return "minecraft";
}

// Look of an in-game server list entry, shared by the dirt and plain themes.
// One 72px dirt tile fills the widget's height exactly, so no row is cut
// off, and the overlay darkens it to about the brightness of the menus.
function minecraftCss(dirt: boolean, online: boolean) {
    return `
@font-face {
    font-family: "Monocraft";
    src: url("${fontUrl}") format("woff2");
    font-display: swap;
}
a {
    gap: 6px;
    padding: 3px;
    border: 2px solid transparent;
    background: ${
        dirt
            ? `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("${dirtUrl}") 0 0 / 72px 72px border-box`
            : "rgba(0, 0, 0, 0.75)"
    };
    image-rendering: pixelated;
    color: #aaaaaa;
    font: 18px/20px "Monocraft", monospace;
    text-shadow: 2px 2px 0 color-mix(in srgb, currentColor 25%, black);
}
a:hover { border-color: #808080; }
.name { color: #fff; }
.players { align-items: flex-end; gap: 6px; }
.dim { color: #555; }
.bars { display: flex; align-items: flex-end; gap: 1px; height: 16px; }
.bars i {
    width: 2px;
    background: ${online ? "#55ff55" : "#3f3f3f"};
    box-shadow: 1px 1px 0 #153f15;
}
.motd { height: 40px; }
.offline { color: #aa0000; }`;
}

// Minewolf's dark theme tokens from app.css, with its fonts and logo.
function minewolfCss(online: boolean) {
    return `
@font-face {
    font-family: "Inter Variable";
    src: url("${interUrl}") format("woff2-variations");
    font-weight: 100 900;
    font-display: swap;
}
@font-face {
    font-family: "Oxanium Variable";
    src: url("${oxaniumUrl}") format("woff2-variations");
    font-weight: 200 800;
    font-display: swap;
}
a {
    position: relative;
    gap: 10px;
    padding: 3px 8px 3px 3px;
    border: 1px solid oklch(1 0 0 / 10%);
    background: oklch(0.214 0.009 43.1);
    color: oklch(0.714 0.014 41.2);
    font: 13px/17px "Inter Variable", sans-serif;
}
a:hover { border-color: oklch(0.52 0.105 223.128); }
img.icon { image-rendering: pixelated; }
.top { align-items: center; margin-top: 3px; }
.name {
    color: oklch(0.986 0.002 67.8);
    font: 600 17px/22px "Oxanium Variable", sans-serif;
}
.players { align-items: center; gap: 6px; font-size: 12px; }
.dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${online ? "#22c55e" : "#ef4444"};
}
.motd { height: 34px; margin-top: 4px; padding-right: 56px; }
.offline { color: #ef4444; }
.logo {
    position: absolute;
    right: 8px;
    bottom: 6px;
    height: 12px;
    opacity: 0.7;
}`;
}

export async function GET({ params, url }) {
    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
        columns: {
            id: true,
            name: true,
            iconUrl: true,
            htmlMotd: true,
            online: true,
            onlinePlayers: true,
            maxPlayers: true,
        },
    });
    if (!server) error(404, "Server listing not found.");

    const pageUrl = `${url.origin}/servers/${server.id}/`;
    const theme = getTheme(url);
    const minewolf = theme === "minewolf";
    const icon = server.iconUrl || noIconUrl;
    // htmlMotd is sanitized to <span style> and <br> when the server is pinged.
    const motd = server.online
        ? server.htmlMotd
        : `<span class="offline">Can't connect to server</span>`;
    const count = server.online
        ? `${server.onlinePlayers}<span class="dim">/</span>${server.maxPlayers}`
        : "";
    // Minecraft themes show five signal bars, all lit when online and all
    // dark when offline; the Minewolf theme shows a status dot.
    const status = minewolf
        ? `<span class="dot"></span>`
        : `<span class="bars">${[1, 2, 3, 4, 5]
              .map((h) => `<i style="height:${h * 3 + 1}px"></i>`)
              .join("")}</span>`;

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(server.name)} - Minewolf</title>
<style>
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: transparent; }
a {
    display: flex;
    height: 72px;
    text-decoration: none;
    overflow: hidden;
}
img.icon {
    width: 64px;
    height: 64px;
    flex: none;
}
.text { flex: 1; min-width: 0; }
.top { display: flex; gap: 8px; }
.name {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.players { flex: none; display: flex; }
.motd { overflow: hidden; word-break: break-word; }
${minewolf ? minewolfCss(server.online) : minecraftCss(theme === "minecraft", server.online)}
</style>
</head>
<body>
<a href="${pageUrl}" target="_blank" rel="noopener" title="${escapeHtml(server.name)} on Minewolf">
    <img class="icon" src="${escapeHtml(icon)}" alt="">
    <div class="text">
        <div class="top">
            <span class="name">${escapeHtml(server.name)}</span>
            <span class="players">${count}${status}</span>
        </div>
        <div class="motd">${motd}</div>
    </div>
    ${minewolf ? `<img class="logo" src="${logoUrl}" alt="Minewolf">` : ""}
</a>
</body>
</html>`;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60",
            "X-Robots-Tag": "noindex",
        },
    });
}
