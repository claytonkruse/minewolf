<script lang="ts">
    import type { PageData } from "./$types";
    import type { Server } from "$lib/server/drizzle/schema";
    import { ServerList } from "$lib/components/ServerList";

    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";

    interface Props {
        data: PageData;
        servers: Array<Server>;
    }

    let { data }: Props = $props();
    let page = $derived(data.page);
    let servers = $derived(data.servers);
    let tag = $derived(data.tag);
</script>

<svelte:head>
    <title>Browse Minecraft Servers - Minewolf</title>
    <meta
        name="description"
        content="Browse dozens of unique Minecraft servers."
    />
</svelte:head>

<h1 class="text-4xl font-bold">Browse Minecraft Servers</h1>
<br />
<form method="GET" class="mx-auto flex max-w-md gap-2">
    <Input type="search" name="name" id="search" placeholder="Search" />
    <Button type="submit">Search</Button>
</form>

{#if tag}
    <p class="text-muted-foreground mt-3">
        Tagged <span class="text-foreground font-medium">{tag}</span>
        · <a href="/servers/" class="underline underline-offset-4">Clear</a>
    </p>
{/if}

<ServerList {servers} />

<!-- <section>
    <h3>Todo</h3>
    <ol>
        <li>Search via query</li>
        <li>Browse by gamemode</li>
        <li>Browse by version</li>
        <li>Random Server</li>
    </ol>
</section> -->
