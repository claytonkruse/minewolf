<script lang="ts">
    import { BarChart, Highlight } from "layerchart";
    import { cubicInOut } from "svelte/easing";
    import * as Card from "$lib/components/ui/card";
    import * as Chart from "$lib/components/ui/chart";
    import type { AnalyticsDay } from "$lib/server/analytics";

    interface Props {
        analytics: AnalyticsDay[];
        days: number;
    }

    let { analytics, days }: Props = $props();

    const chartConfig = {
        listingViews: { label: "Listing Views", color: "var(--chart-2)" },
        pageViews: { label: "Page Views", color: "var(--chart-3)" },
        votes: { label: "Votes", color: "var(--chart-1)" },
    } satisfies Chart.ChartConfig;
    type Metric = keyof typeof chartConfig;
    const metrics = Object.keys(chartConfig) as Metric[];

    function total(metric: Metric) {
        return analytics.reduce((sum, day) => sum + day[metric], 0);
    }

    // Dates are UTC midnights, so format them in UTC to avoid off-by-one days.
    function formatDay(date: Date, options: Intl.DateTimeFormatOptions) {
        return date.toLocaleDateString("en-US", {
            ...options,
            timeZone: "UTC",
        });
    }
</script>

<section class="mt-6 flex flex-col gap-4 text-left">
    <div>
        <h2 class="text-lg font-bold">Analytics</h2>
        <p class="text-muted-foreground text-xs">Last {days} days</p>
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
        {#each metrics as metric (metric)}
            <Card.Root>
                <Card.Header>
                    <Card.Description>
                        {chartConfig[metric].label}
                    </Card.Description>
                    <Card.Title class="text-3xl">
                        {total(metric).toLocaleString()}
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <Chart.Container
                        config={chartConfig}
                        class="aspect-auto h-[200px] w-full"
                    >
                        <BarChart
                            data={analytics}
                            x="date"
                            axis="x"
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
                                        formatDay(d, {
                                            month: "short",
                                            day: "numeric",
                                        }),
                                    ticks: (scale: { domain(): Date[] }) =>
                                        scale
                                            .domain()
                                            .filter((_, i) => i % 7 === 0),
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
                                />
                            {/snippet}
                        </BarChart>
                    </Chart.Container>
                </Card.Content>
            </Card.Root>
        {/each}
    </div>
</section>
