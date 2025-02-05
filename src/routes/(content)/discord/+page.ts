import { PUBLIC_DISCORD_INVITE } from "$env/static/public";
import { redirect } from "@sveltejs/kit";

export const load: PageLoad = () => {
    throw redirect(302, PUBLIC_DISCORD_INVITE);
};
