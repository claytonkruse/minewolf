<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import ServerListItem from "./ServerListItem.svelte";
    import type { Server } from "$lib/server/db/drizzle/schema";

    type Props = {
        servers?: Array<Server & { uptime?: number | null }>;
        lastColumn?: string;
        // Show sponsor levels (star + position) instead of rank.
        sponsor?: boolean;
        children?: () => any;
    };

    let { lastColumn, servers, sponsor = false, children }: Props = $props();
</script>

<Table.Root class="m-auto w-max">
    <Table.Header>
        <Table.Row>
            <Table.Head class="w-16 min-w-16 text-center"
                >{sponsor ? "Level" : "Rank"}</Table.Head
            >
            <Table.Head class="text-center">Icon</Table.Head>
            <Table.Head class="w-48 text-center">Name</Table.Head>
            <!-- 468px banner + 16px cell padding -->
            <Table.Head class="w-[484px] min-w-[484px] text-center"
                >Banner/MOTD</Table.Head
            >
            <Table.Head class="w-20 min-w-20 text-center">Players</Table.Head>
            <Table.Head class="w-20 min-w-20 text-center">Status</Table.Head>

            {#if lastColumn}
                <Table.Head class="text-center">{lastColumn}</Table.Head>
            {/if}
        </Table.Row>
    </Table.Header>

    <Table.Body>
        {#if children}
            {@render children()}
        {:else if servers && servers.length > 0}
            {#each servers as server}
                <ServerListItem {server} {sponsor} />
            {/each}
        {:else}
            <span class="text-muted-foreground">No servers.</span>
        {/if}
    </Table.Body>
</Table.Root>
