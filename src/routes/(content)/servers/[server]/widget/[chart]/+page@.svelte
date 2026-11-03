<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import ServerHistoryCard from "$lib/components/ServerHistoryCard.svelte";
    import { page } from "$app/state";
    import type { PageData } from "./$types";

    // Embeddable history chart, shown in an iframe on other sites. Resets to
    // the root layout so it has no site header or footer.
    let { data }: { data: PageData } = $props();
    let { server } = $derived(data);
    let serverUrl = $derived(`${page.url.origin}/servers/${server.id}/`);

    const labels = {
        uptime: "uptime",
        votes: "votes",
        players: "average players",
        rank: "rank",
    };
</script>

<Seo
    title="{server.name} {labels[data.metric]} - Minewolf"
    description="{server.name} {labels[data.metric]} on Minewolf."
    noindex
/>

<svelte:head>
    <style>
        html,
        body {
            background: transparent;
        }
    </style>
</svelte:head>

<div class="text-left">
    <ServerHistoryCard
        metric={data.metric}
        history={data.history}
        uptime={data.uptime}
        rank={server.rank}
    >
        {#snippet description()}
            <a href={serverUrl} target="_blank" rel="noopener">{server.name}</a>
            · {labels[data.metric]}
        {/snippet}
        {#snippet footer()}
            <a
                href={serverUrl}
                target="_blank"
                rel="noopener"
                class="text-muted-foreground text-xs"
            >
                Last {data.historyDays} days on Minewolf
            </a>
        {/snippet}
    </ServerHistoryCard>
</div>
