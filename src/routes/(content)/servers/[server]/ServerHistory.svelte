<script lang="ts">
    import ServerHistoryCard, {
        historyMetrics,
    } from "$lib/components/ServerHistoryCard.svelte";
    import type { HistoryDay } from "$lib/server/analytics";

    interface Props {
        history: HistoryDay[];
        days: number;
        // Uptime percent over the whole window, or null if never pinged.
        uptime: number | null;
        // Current rank, 0 = unranked.
        rank: number;
    }

    let { history, days, uptime, rank }: Props = $props();
</script>

<section class="lg:panel">
    <div class="mb-3">
        <h2 class="font-heading text-xl font-bold">History</h2>
        <p class="text-muted-foreground text-xs">Last {days} days</p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
        {#each historyMetrics as metric (metric)}
            <ServerHistoryCard {metric} {history} {uptime} {rank} />
        {/each}
    </div>
</section>
