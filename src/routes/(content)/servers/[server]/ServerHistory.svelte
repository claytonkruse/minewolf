<script lang="ts">
    import { BarChart, Highlight } from "layerchart";
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
    }

    let { history, days, uptime }: Props = $props();

    const chartConfig = {
        uptime: { label: "Uptime", color: "var(--chart-3)" },
        votes: { label: "Votes", color: "var(--chart-1)" },
    } satisfies Chart.ChartConfig;
    type Metric = keyof typeof chartConfig;

    let totalVotes = $derived(history.reduce((sum, day) => sum + day.votes, 0));

    // Dates are UTC midnights, so format them in UTC to avoid off-by-one days.
    function formatDay(date: Date, options: Intl.DateTimeFormatOptions) {
        return date.toLocaleDateString("en-US", {
            ...options,
            timeZone: "UTC",
        });
    }
</script>

{#snippet chart(metric: Metric)}
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
                xAxis: {
                    format: (d: Date) =>
                        formatDay(d, { month: "short", day: "numeric" }),
                    ticks: (scale: { domain(): Date[] }) =>
                        scale.domain().filter((_, i) => i % 7 === 0),
                },
            }}
        >
            {#snippet belowMarks()}
                <Highlight area={{ class: "fill-muted" }} />
            {/snippet}
            {#snippet tooltip()}
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
                                {#if metric === "uptime"}
                                    {value == null
                                        ? "No data"
                                        : formatUptime(Number(value))}
                                {:else}
                                    {Number(value).toLocaleString()}
                                {/if}
                            </span>
                        </div>
                    {/snippet}
                </Chart.Tooltip>
            {/snippet}
        </BarChart>
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
    </div>
</section>
