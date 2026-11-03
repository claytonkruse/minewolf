import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { renderWidgetImage } from "$lib/server/widgetImage";
import font from "$lib/assets/fonts/monocraft.ttf?inline";
import boldFont from "$lib/assets/fonts/monocraft-bold.ttf?inline";
// Unifont (OFL, see unifont-LICENSE.txt), only used here, never sent to
// browsers.
import fallbackFont from "$lib/assets/fonts/unifont.otf?inline";
import dirt from "$lib/assets/dirt.png?inline";
import noIcon from "$lib/assets/pack.png?inline";

// The Minecraft theme of the server widget as a PNG, for Discord embeds and
// anywhere else that only takes images.

// ?inline gives base64 data URIs; decode them once.
const fromDataUri = (uri: string) => Buffer.from(uri.split(",")[1], "base64");
const assets = {
    font: fromDataUri(font),
    boldFont: fromDataUri(boldFont),
    fallbackFont: fromDataUri(fallbackFont),
    dirt: fromDataUri(dirt),
    noIcon: fromDataUri(noIcon),
};

export async function GET({ params }) {
    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
        columns: {
            name: true,
            iconUrl: true,
            htmlMotd: true,
            online: true,
            onlinePlayers: true,
            maxPlayers: true,
        },
    });
    if (!server) error(404, "Server listing not found.");

    return new Response(await renderWidgetImage(server, assets), {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=300",
        },
    });
}
