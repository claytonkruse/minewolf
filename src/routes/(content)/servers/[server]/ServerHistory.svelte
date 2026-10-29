<script lang="ts">
    import { BarChart, Highlight, LineChart } from "layerchart";
    import { cubicInOut } from "svelte/easing";
    import * as Card from "$lib/components/ui/card";
    import * as Chart from "$lib/components/ui/chart";
    import type { HistoryDay } from "$lib/server/analytics";
    import { formatUptime } from "$lib/utils/formatUptime";

    interface Props {
        history: HistoryDay[];
        days: number;
        // Uptime percent over the whole window, or null if never pinged.
        uptime: number | null;
        // Current rank, 0 = unranked.
        rank: number;
    }

    let { history, days, uptime, rank }: Props = $props();

    const chartConfig = {
        uptime: { label: "Uptime", color: "var(--chart-3)" },
        votes: { label: "Votes", color: "var(--chart-1)" },
        players: { label: "Players", color: "var(--chart-2)" },
        rank: { label: "Rank", color: "var(--chart-4)" },
    } satisfies Chart.ChartConfig;
    type Metric = keyof typeof chartConfig;

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

    function formatValue(metric: Metric, value: unknown) {
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

{#snippet dayTooltip(metric: Metric)}
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

{#snippet chart(metric: Exclude<Metric, "rank">)}
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

<section class="lg:panel">
    <div class="mb-3">
        <h2 class="font-heading text-xl font-bold">History</h2>
        <p class="text-muted-foreground text-xs">Last {days} days</p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
        <Card.Root>
            <Card.Header>
                <Card.Description>Uptime</Card.Description>
                <Card.Title class="text-3xl">
                    {uptime == null ? "No data yet" : formatUptime(uptime)}
                </Card.Title>
            </Card.Header>
            <Card.Content>
                {@render chart("uptime")}
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Votes</Card.Description>
                <Card.Title class="text-3xl">
                    {totalVotes.toLocaleString()}
                </Card.Title>
            </Card.Header>
            <Card.Content>
                {@render chart("votes")}
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Average players</Card.Description>
                <Card.Title class="text-3xl">
                    {avgPlayers == null
                        ? "No data yet"
                        : formatPlayers(avgPlayers)}
                </Card.Title>
            </Card.Header>
            <Card.Content>
                {@render chart("players")}
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Rank</Card.Description>
                <Card.Title class="text-3xl">
                    {rank > 0 ? `#${rank}` : "Unranked"}
                </Card.Title>
            </Card.Header>
            <Card.Content>
                {@render rankChart()}
            </Card.Content>
        </Card.Root>
    </div>
</section>
