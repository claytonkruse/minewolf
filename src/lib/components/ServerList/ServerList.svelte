<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import ServerListItem from "./ServerLIstItem.svelte";
    import type { Server } from "$lib/server/drizzle/schema";

    type Props = {
        servers?: Array<Server>;
        lastColumn?: string;
        children?: () => any;
    };

    let { lastColumn, servers, children }: Props = $props();
</script>

<Table.Root class="m-auto w-max">
    <Table.Header>
        <Table.Row>
            <Table.Head>Rank</Table.Head>
            <Table.Head>Icon</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Banner/MOTD</Table.Head>
            <Table.Head>Players</Table.Head>
            <Table.Head>Status</Table.Head>

            {#if lastColumn}
                <Table.Head>{lastColumn}</Table.Head>
            {/if}
        </Table.Row>
    </Table.Header>

    <Table.Body>
        {#if children}
            {@render children()}
        {:else if servers && servers.length > 0}
            {#each servers as server}
                <ServerListItem {server} />
            {/each}
        {:else}
            <span class="text-muted-foreground">No servers.</span>
        {/if}
    </Table.Body>
</Table.Root>
