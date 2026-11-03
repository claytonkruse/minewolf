import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";

// Serves the icon from the server's last ping, which is stored as a data: URI.
// Gives places that need a real URL (like Discord embeds) something to load.
export async function GET({ params }) {
    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
        columns: { iconUrl: true },
    });
    const match = server?.iconUrl.match(/^data:image\/png;base64,(.+)$/);
    if (!match) error(404, "No icon.");

    return new Response(Buffer.from(match[1], "base64"), {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600",
        },
    });
}
