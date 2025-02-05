<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import type { PageData } from "./$types";
    import { ServerList, ServerListItem } from "$lib/components/ServerList";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const { servers } = data;
</script>

<svelte:head>
    <title>Your Servers - Minewolf</title>
</svelte:head>

<h1 class="text-2xl font-bold">Your Server Listings</h1>

{#if data.servers.length === 0}
    <p class="text-muted-foreground">You have yet to list any servers.</p>
{:else}
    <ServerList lastColumn="Actions">
        {#each data.servers as server}
            <ServerListItem {server}>
                <ul class="flex gap-1">
                    <li>
                        <Button
                            variant="secondary"
                            href={"/servers/" + server.id}>View</Button
                        >
                    </li>
                    <li>
                        <Button
                            variant="secondary"
                            href={`/dashboard/servers/${server.id}/`}
                            >Manage</Button
                        >
                    </li>
                    <li>
                        <Button
                            variant="destructive"
                            href={`/dashboard/servers/${server.id}/remove/`}
                            >Remove</Button
                        >
                    </li>
                </ul>
            </ServerListItem>
        {/each}
    </ServerList>
{/if}

<br />
<Button variant="outline" href="/add-server/">Add Server</Button>
