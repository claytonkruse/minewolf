<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import type { PageData } from "./$types";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
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

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/dashboard/">Dashboard</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Page>Servers</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="m-auto max-w-fit">
    <h1 class="text-2xl font-bold">Your Server Listings</h1>

    {#if data.servers.length === 0}
        <p class="text-muted-foreground">You have yet to list any servers.</p>
    {:else}
        <ServerList lastColumn="Actions">
            {#each servers as server}
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
    <div class="flex justify-between">
        <Button variant="outline" href="..">Go Back</Button>
        <Button variant="outline" href="/add-server/">Add Server</Button>
    </div>
</div>
