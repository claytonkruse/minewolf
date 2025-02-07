<script lang="ts">
    import * as arctic from "arctic";
    import {
        PUBLIC_DISCORD_CLIENT_ID as clientId,
        PUBLIC_DISCORD_OAUTH_REDIRECT_URI as redirectURI,
    } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import Icon from "~icons/pajamas/discord";
    import logo from "$lib/images/logo.png";
    import { page } from "$app/state";
    import localize_url from "$lib/utils/localize_url";

    const discord = new arctic.Discord(clientId, null, redirectURI);
    const state = arctic.generateState();
    const scopes = ["identify", "email", "guilds"];
    const href = discord.createAuthorizationURL(state, null, scopes).toString();
</script>

<svelte:head>
    <title>Login - Minewolf</title>
    <meta name="description" content="Log in to Minewolf with Discord." />
</svelte:head>

<div class="flex h-full content-center items-center justify-center text-center">
    <div>
        <hgroup>
            <img class="block w-80" src={logo} alt="Minewolf" />
            <br />
            <h1 class="text-center text-lg font-bold uppercase tracking-widest">
                Sign In
            </h1>
        </hgroup>
        <small class="text-muted-foreground">
            An account will be created automatically for you.
        </small>

        <br /><br />

        <Button
            {href}
            class="bg-[#5865F2] font-bold uppercase text-primary transition hover:scale-105 hover:bg-[#5865F2]"
            ><Icon /> Log in with Discord</Button
        >

        <br /><br />

        <Button
            variant="link"
            href={localize_url(page.url.searchParams.get("to")) || "/"}
            >Go Back</Button
        >

        <br /><br /><br /><br />
    </div>
</div>
