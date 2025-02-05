import * as arctic from "arctic";
import {
    PUBLIC_DISCORD_OAUTH_REDIRECT_URI,
    PUBLIC_DISCORD_CLIENT_ID,
} from "$env/static/public";
import { DISCORD_CLIENT_SECRET } from "$env/static/private";

export const discord = new arctic.Discord(
    PUBLIC_DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    PUBLIC_DISCORD_OAUTH_REDIRECT_URI,
);
