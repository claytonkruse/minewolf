<script lang="ts">
    import type { PageData } from "./$types";
    import type { Server } from "$lib/server/drizzle/schema";
    import { ServerList } from "$lib/components/ServerList";
    import Pagination, { pageSuffix } from "$lib/components/Pagination.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import { trackViews } from "$lib/utils/trackViews";

    interface Props {
        data: PageData;
        servers: Array<Server>;
    }

    let { data }: Props = $props();
    let page = $derived(data.page);
    let servers = $derived(data.servers);
    let tag = $derived(data.tag);

    $effect(() => {
        trackViews(
            "listing",
            servers.map((server) => server.id),
        );
    });
</script>

<!-- Search results are endless near-duplicates, so only tag pages get indexed. -->
<Seo
    title="{tag
        ? `${tag[0].toUpperCase() + tag.slice(1)} Minecraft Servers`
        : 'Browse Minecraft Servers'}{pageSuffix(page)} - Minewolf"
    description={tag
        ? `Browse Minecraft servers tagged ${tag} on Minewolf.`
        : "Browse dozens of unique Minecraft servers."}
    noindex={!!data.name}
/>

<h1 class="text-4xl font-bold">Browse Minecraft Servers</h1>

{#if tag}
    <p class="text-muted-foreground mt-3">
        Tagged <span class="text-foreground font-medium">{tag}</span>
        · <a href="/servers/" class="underline underline-offset-4">Clear</a>
    </p>
{/if}

<ServerList {servers} />

<div class="mt-6">
    <Pagination {page} pageCount={data.pageCount} />
</div>

<!-- <section>
    <h3>Todo</h3>
    <ol>
        <li>Search via query</li>
        <li>Browse by gamemode</li>
        <li>Browse by version</li>
        <li>Random Server</li>
    </ol>
</section> -->
