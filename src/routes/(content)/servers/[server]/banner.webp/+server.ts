import { error } from "@sveltejs/kit";
import fs from "fs/promises";

export async function GET({ params }) {
    const { server } = params;
    const filepath = `storage/server-banners/${server}.webp`;
    const file = await fs
        .readFile(filepath)
        .catch((e) => error(404, "Unable to read file."));
    return new Response(file);
}
