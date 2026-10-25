<script lang="ts">
    import type { Server } from "$lib/server/db/drizzle/schema";
    import { Row, Cell } from "$lib/components/ui/table";
    import Banner from "$lib/components/Banner.svelte";
    import ServerIcon from "$lib/components/ServerIcon.svelte";
    import { goto } from "$app/navigation";
    import StarIcon from "@lucide/svelte/icons/star";

    interface Props {
        server: Server;
        sponsor?: boolean;
        children?: () => any;
    }

    let { server, sponsor = false, children }: Props = $props();
</script>

<Row onclick={() => goto(`/servers/${server.id}/`)}>
    <Cell class="text-lg font-bold">
        {#if sponsor}
            <span class="inline-flex items-center gap-1">
                <StarIcon class="size-4 fill-current" />{server.sponsorPosition}
            </span>
        {:else}
            {server.rank || "?"}
        {/if}
    </Cell>

    <Cell>
        <ServerIcon src={server.iconUrl} />
    </Cell>

    <Cell>
        <h4 class="text-lg font-bold">
            <a href={`/servers/${server.id}/`}>{server.name}</a>
        </h4>
    </Cell>

    <Cell>
        <a href={`/servers/${server.id}/`}>
            {#if server.bannerUrl}
                <Banner src={server.bannerUrl} />
            {:else if server.htmlMotd}
                <div
                    class="max-h-[60px] max-w-[468px] overflow-hidden text-left"
                >
                    {@html server.htmlMotd}
                </div>
            {:else}
                <p class="text-muted-foreground">No Banner</p>
            {/if}
        </a>
    </Cell>

    <Cell>{server.onlinePlayers} / {server.maxPlayers}</Cell>

    <Cell>
        {#if server.online}
            <span class="text-green-500">Online</span>
        {:else}
            <span class="text-destructive">Offline</span>
        {/if}
    </Cell>

    {#if children}
        <Cell>{@render children()}</Cell>
    {/if}
</Row>
