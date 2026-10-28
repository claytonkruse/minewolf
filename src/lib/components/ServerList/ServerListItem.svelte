<script lang="ts">
    import type { Server } from "$lib/server/db/drizzle/schema";
    import { Row, Cell } from "$lib/components/ui/table";
    import Banner from "$lib/components/Banner.svelte";
    import ServerIcon from "$lib/components/ServerIcon.svelte";
    import { goto } from "$app/navigation";
    import StarIcon from "@lucide/svelte/icons/star";
    import ServerHoverCard from "$lib/components/ServerHoverCard.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { formatUptime } from "$lib/utils/formatUptime";

    interface Props {
        // uptime is a percent over the last 30 days; null means no pings yet.
        server: Server & { uptime?: number | null };
        sponsor?: boolean;
        children?: () => any;
    }

    let { server, sponsor = false, children }: Props = $props();
</script>

<Row onclick={() => goto(`/servers/${server.id}/`)}>
    <Cell class="w-16 min-w-16 text-lg font-bold">
        {#if sponsor}
            <span class="inline-flex items-center gap-1">
                <StarIcon class="size-4 fill-current" />{server.sponsorPosition}
            </span>
        {:else}
            {server.rank || "?"}
        {/if}
    </Cell>

    <Cell>
        <ServerHoverCard {server}>
            {#snippet trigger({ props })}
                <div {...props}>
                    <ServerIcon src={server.iconUrl} />
                </div>
            {/snippet}
        </ServerHoverCard>
    </Cell>

    <Cell class="w-48 max-w-48 whitespace-normal">
        <h4 class="text-lg font-bold break-words">
            <ServerHoverCard {server}>
                {#snippet trigger({ props })}
                    <a {...props} href={`/servers/${server.id}/`}
                        >{server.name}</a
                    >
                {/snippet}
            </ServerHoverCard>
        </h4>
    </Cell>

    <Cell class="w-[484px] min-w-[484px]">
        <ServerHoverCard {server}>
            {#snippet trigger({ props })}
                <a {...props} href={`/servers/${server.id}/`}>
                    {#if server.bannerUrl}
                        <Banner src={server.bannerUrl} />
                    {:else if server.htmlMotd}
                        <div
                            class="mx-auto max-h-[60px] max-w-[468px] overflow-hidden"
                        >
                            {@html server.htmlMotd}
                        </div>
                    {:else}
                        <p class="text-muted-foreground">No Banner</p>
                    {/if}
                </a>
            {/snippet}
        </ServerHoverCard>
    </Cell>

    <Cell class="w-20 min-w-20">
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        <span {...props}>{server.onlinePlayers}</span>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {server.onlinePlayers} / {server.maxPlayers}
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    </Cell>

    <Cell class="w-20 min-w-20">
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        {#if server.online}
                            <span {...props} class="text-green-500">Online</span
                            >
                        {:else}
                            <span {...props} class="text-destructive"
                                >Offline</span
                            >
                        {/if}
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {server.uptime == null
                        ? "No uptime data yet"
                        : `${formatUptime(server.uptime)} uptime`}
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    </Cell>

    {#if children}
        <Cell>{@render children()}</Cell>
    {/if}
</Row>
