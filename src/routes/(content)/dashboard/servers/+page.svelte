<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
    import type { PageData } from "./$types";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { ServerList, ServerListItem } from "$lib/components/ServerList";
    import ViewIcon from "@lucide/svelte/icons/eye";
    import ManageIcon from "@lucide/svelte/icons/settings";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const { servers } = data;

    function actions(id: number) {
        return [
            { href: `/servers/${id}/`, label: "View", icon: ViewIcon },
            {
                href: `/dashboard/servers/${id}/`,
                label: "Manage",
                icon: ManageIcon,
            },
        ];
    }
</script>

<Seo
    title="Your Servers - Minewolf"
    description="Manage your Minecraft server listings on Minewolf."
    noindex
/>

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
        <Tooltip.Provider>
            <ServerList lastColumn="Actions">
                {#each servers as server}
                    <ServerListItem {server}>
                        <ul class="flex gap-1">
                            {#each actions(server.id) as action}
                                <li>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger>
                                            {#snippet child({ props })}
                                                <Button
                                                    {...props}
                                                    variant="secondary"
                                                    size="icon"
                                                    href={action.href}
                                                    aria-label={action.label}
                                                >
                                                    <action.icon />
                                                </Button>
                                            {/snippet}
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>
                                            {action.label}
                                        </Tooltip.Content>
                                    </Tooltip.Root>
                                </li>
                            {/each}
                        </ul>
                    </ServerListItem>
                {/each}
            </ServerList>
        </Tooltip.Provider>
    {/if}
    <br />
    <div class="flex justify-between">
        <Button variant="outline" href="..">Go Back</Button>
        <Button variant="outline" href="/add-server/">Add Server</Button>
    </div>
</div>
