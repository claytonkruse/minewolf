<script lang="ts" module>
    export const historyMetrics = [
        "uptime",
        "votes",
        "players",
        "rank",
    ] as const;
    export type HistoryMetric = (typeof historyMetrics)[number];
</script>

<script lang="ts">
    import type { Snippet } from "svelte";
    import { BarChart, Highlight, LineChart } from "layerchart";
    import { cubicInOut } from "svelte/easing";
    import * as Card from "$lib/components/ui/card";
    import * as Chart from "$lib/components/ui/chart";
    import type { HistoryDay } from "$lib/server/analytics";
    import { formatUptime } from "$lib/utils/formatUptime";

    // One card of a server's history: a headline number and a daily chart.
    // Used on the server page and on the embeddable chart pages.
    interface Props {
        metric: HistoryMetric;
        history: HistoryDay[];
        // Uptime percent over the whole window, or null if never pinged.
        uptime: number | null;
        // Current rank, 0 = unranked.
        rank: number;
        // Replaces the metric name above the headline number.
        description?: Snippet;
        footer?: Snippet;
    }

    let { metric, history, uptime, rank, description, footer }: Props =
        $props();

    const chartConfig = {
        uptime: { label: "Uptime", color: "var(--chart-3)" },
        votes: { label: "Votes", color: "var(--chart-1)" },
        players: { label: "Players", color: "var(--chart-2)" },
        rank: { label: "Rank", color: "var(--chart-4)" },
    } satisfies Chart.ChartConfig;

    const titles: Record<HistoryMetric, string> = {
        uptime: "Uptime",
        votes: "Votes",
        players: "Average players",
        rank: "Rank",
    };

    let totalVotes = $derived(history.reduce((sum, day) => sum + day.votes, 0));

    // Average of the daily player averages, over days that were pinged.
    let avgPlayers = $derived.by(() => {
        const pinged = history.filter((day) => day.players != null);
        if (pinged.length === 0) return null;
        return (
            pinged.reduce((sum, day) => sum + (day.players ?? 0), 0) /
            pinged.length
        );
    });

    let headline = $derived.by(() => {
        if (metric === "uptime")
            return uptime == null ? "No data yet" : formatUptime(uptime);
        if (metric === "votes") return totalVotes.toLocaleString();
        if (metric === "players")
            return avgPlayers == null
                ? "No data yet"
                : formatPlayers(avgPlayers);
        return rank > 0 ? `#${rank}` : "Unranked";
    });

    // Dates are UTC midnights, so format them in UTC to avoid off-by-one days.
    function formatDay(date: Date, options: Intl.DateTimeFormatOptions) {
        return date.toLocaleDateString("en-US", {
            ...options,
            timeZone: "UTC",
        });
    }

    function formatPlayers(players: number) {
        return players.toLocaleString("en-US", { maximumFractionDigits: 1 });
    }

    function formatValue(metric: HistoryMetric, value: unknown) {
        if (value == null) return metric === "rank" ? "Unranked" : "No data";
        const n = Number(value);
        if (metric === "uptime") return formatUptime(n);
        if (metric === "players") return formatPlayers(n);
        if (metric === "rank") return `#${n}`;
        return n.toLocaleString();
    }

    const xAxis = {
        format: (d: Date) => formatDay(d, { month: "short", day: "numeric" }),
        ticks: (scale: { domain(): Date[] }) =>
            scale.domain().filter((_, i) => i % 7 === 0),
    };
</script>

{#snippet dayTooltip(metric: HistoryMetric)}
    <Chart.Tooltip
        labelFormatter={(d: Date) =>
            formatDay(d, {
                month: "short",
                day: "numeric",
                year: "numeric",
            })}
    >
        {#snippet formatter({ value })}
            <div class="flex w-full justify-between gap-4">
                <span class="text-muted-foreground"
                    >{chartConfig[metric].label}</span
                >
                <span class="font-mono font-medium tabular-nums">
                    {formatValue(metric, value)}
                </span>
            </div>
        {/snippet}
    </Chart.Tooltip>
{/snippet}

{#snippet chart(metric: Exclude<HistoryMetric, "rank">)}
    <Chart.Container config={chartConfig} class="aspect-auto h-[200px] w-full">
        <BarChart
            data={history}
            x="date"
            axis="x"
            yDomain={metric === "uptime" ? [0, 100] : undefined}
            series={[
                {
                    key: metric,
                    label: chartConfig[metric].label,
                    color: chartConfig[metric].color,
                },
            ]}
            props={{
                bars: {
                    stroke: "none",
                    rounded: "none",
                    motion: {
                        type: "tween",
                        duration: 500,
                        easing: cubicInOut,
                    },
                },
                highlight: { area: { fill: "none" } },
                xAxis,
            }}
        >
            {#snippet belowMarks()}
                <Highlight area={{ class: "fill-muted" }} />
            {/snippet}
            {#snippet tooltip()}
                {@render dayTooltip(metric)}
            {/snippet}
        </BarChart>
    </Chart.Container>
{/snippet}

{#snippet rankChart()}
    <Chart.Container config={chartConfig} class="aspect-auto h-[200px] w-full">
        <!-- rank 1 is best, so flip the y axis to put it on top -->
        <LineChart
            data={history}
            x="date"
            axis="x"
            yReverse
            series={[
                {
                    key: "rank",
                    label: chartConfig.rank.label,
                    color: chartConfig.rank.color,
                },
            ]}
            props={{
                spline: { class: "stroke-2" },
                xAxis,
            }}
        >
            {#snippet tooltip()}
                {@render dayTooltip("rank")}
            {/snippet}
        </LineChart>
    </Chart.Container>
{/snippet}

<Card.Root>
    <Card.Header>
        <Card.Description>
            {#if description}
                {@render description()}
            {:else}
                {titles[metric]}
            {/if}
        </Card.Description>
        <Card.Title class="text-3xl">{headline}</Card.Title>
    </Card.Header>
    <Card.Content>
        {#if metric === "rank"}
            {@render rankChart()}
        {:else}
            {@render chart(metric)}
        {/if}
    </Card.Content>
    {#if footer}
        <Card.Footer>
            {@render footer()}
        </Card.Footer>
    {/if}
</Card.Root>
