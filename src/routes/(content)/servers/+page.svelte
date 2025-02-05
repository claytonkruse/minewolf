<script lang="ts">
    import type { PageData } from "./$types";
    import type { Server } from "$lib/server/drizzle/schema";
    import { ServerList } from "$lib/components/ServerList";

    interface Props {
        data: PageData;
        servers: Array<Server>;
    }

    let { data }: Props = $props();
    let page = $derived(data.page);
    let servers = data.servers;
</script>

<svelte:head>
    <title>Browse Minecraft Servers - Minewolf</title>
</svelte:head>

<h1>Browse Minecraft Servers</h1>
<form>
    <input type="search" name="q" id="search" />
</form>

<ServerList {servers} />

<section>
    <h3>Todo</h3>
    <ol>
        <li>Search via query</li>
        <li>Browse by gamemode</li>
        <li>Browse by version</li>
        <li>Random Server</li>
    </ol>
</section>
