<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { PUBLIC_DISCORD_INVITE } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import DiscordIcon from "~icons/bi/discord";
</script>

<Seo
    title="Minecraft Server Discord Community - Minewolf"
    description="Join the Minewolf Discord, an active Minecraft community where you can advertise your Minecraft server, find new servers to play, and get support."
/>

<div class="mx-auto max-w-full text-left" data-fit-panel data-panels>
    <section class="lg:panel w-2xl max-w-full">
        <h1 class="font-heading flex items-center gap-3 text-4xl font-bold">
            <DiscordIcon class="size-8" /> Minewolf Discord
        </h1>
        <p class="text-muted-foreground mt-3 text-lg">
            The Minewolf Discord is an active community of Minecraft players and
            server owners. Hang out, chat about Minecraft, and connect with the
            Minewolf team and others who love the game as much as you do.
        </p>

        <h2 class="font-heading mt-8 text-xl font-bold">
            Advertise your Minecraft server
        </h2>
        <p class="text-muted-foreground mt-2">
            Promote your Minecraft server in our server advertising channels and
            put it in front of players looking for their next server. It's a
            free way to grow your player base and build your own community.
        </p>

        <h2 class="font-heading mt-8 text-xl font-bold">
            Find cool Minecraft servers
        </h2>
        <p class="text-muted-foreground mt-2">
            Looking for somewhere new to play? Discover survival, SMP, PvP,
            minigame, and modded servers that members are sharing, and swap
            recommendations with players who know what's worth joining.
        </p>

        <h2 class="font-heading mt-8 text-xl font-bold">Get support</h2>
        <p class="text-muted-foreground mt-2">
            Need help with your server listing, your account, or something on
            the site? Ask in the Discord and the Minewolf team and community
            will help you out.
        </p>

        <Button
            class="mt-6 bg-[#5865F2] text-white hover:bg-[#4752C4]"
            size="lg"
            href={PUBLIC_DISCORD_INVITE}
            target="_blank"
            rel="nofollow noopener noreferrer"
        >
            <DiscordIcon /> Join our Discord
        </Button>
    </section>
</div>
