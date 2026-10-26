<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import logo from "$lib/assets/logo-large.png";
    import DiscordIcon from "~icons/bi/discord";
    import HelpIcon from "@lucide/svelte/icons/circle-question-mark";
    import { ServerList } from "$lib/components/ServerList";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let sponsors = $derived(data.sponsors);
    let topServers = $derived(data.topServers);
</script>

<svelte:head>
    <title>Minewolf - The Superior Minecraft Server List</title>
    <meta
        name="description"
        content="Minewolf is a new Minecraft server list that is different. Add your server before launch day now!"
    />
</svelte:head>

<div
    class="mx-auto flex max-w-full flex-col gap-12 lg:gap-4"
    data-fit-panel
    data-panels
>
    <section class="lg:panel">
        <hgroup class="text-center">
            <h1>
                <img class="mx-auto block w-80" src={logo} alt="Minewolf" />
            </h1>
            <h2>The Superior Minecraft Server List</h2>
        </hgroup>
        <br />

        <!-- <p>
            Minewolf is the website dedicated to providing the best Minecraft server
            list experience for players and server owners. Here on Minewolf, servers are
            universally ranked by a multitude of factors to provide players with the
            highest quality servers, while doing everything we can to help high quality
            small servers grow. Find a hidden gem, or list your server today!
        </p> -->

        <p>
            Minewolf is a new Minecraft server list that is different. Add your
            server before launch day now!
        </p>

        <br />
        <div class="flex flex-wrap justify-center gap-2">
            <Button variant="default" href="/add-server/"
                >Add Your Server</Button
            >
            <Button
                variant="outline"
                href="/discord/"
            >
                <DiscordIcon /> Join our Discord
            </Button>
        </div>
    </section>

    {#if sponsors.length > 0}
        <section class="lg:panel">
            <div class="mb-3 flex items-center justify-center gap-1">
                <h2 class="font-heading text-2xl font-bold">Sponsors</h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    href="/sponsor/"
                    aria-label="How to become a sponsor"
                    title="How to become a sponsor"
                >
                    <HelpIcon />
                </Button>
            </div>
            <ServerList servers={sponsors} sponsor />
        </section>
    {/if}

    <section class="lg:panel">
        <h2 class="font-heading mb-3 text-2xl font-bold">Top Servers</h2>
        <ServerList servers={topServers} />
        <Button variant="outline" class="mt-4" href="/servers/">
            Browse All Servers
        </Button>
    </section>
</div>

<!-- <iframe
    title="Discord"
    class="mx-auto mt-36"
    src="https://discord.com/widget?id=1299235285271314463&theme=dark"
    width="350"
    height="500"
    allowtransparency={true}
    frameborder="0"
    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
></iframe> -->

<!-- <h3 class="text-xl font-bold">Sponsor Servers</h3>
<h3 class="text-xl font-bold">Featured Servers</h3>
<h3 class="text-xl font-bold">Top Servers</h3>
<h3 class="text-xl font-bold">Other Servers</h3>
<nav>
    <ul>
        <li>
            <a href="/servers/?version=1.20.4"
                >Servers on Minecraft 1.20.4 (latest)</a
            >
        </li>
        <li><a href="/servers/?crossplay=true">Servers with Crossplay</a></li>
        <li><a href="/servers/?new=true">New Servers</a></li>
    </ul>
</nav> -->
