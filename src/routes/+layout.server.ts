import type { LayoutServerLoad } from "./$types";
import { hasRole } from "$lib/server/roles";
import { wallpapers } from "$lib/wallpapers";

export const load = (async ({ locals }) => {
    const { user } = locals;
    const wallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    return { user, isAdmin: hasRole(user, "admin"), wallpaper };
}) satisfies LayoutServerLoad;
