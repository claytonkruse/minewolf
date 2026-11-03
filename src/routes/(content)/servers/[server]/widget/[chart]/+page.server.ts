import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import {
    ANALYTICS_DAYS,
    getServerHistory,
    getUptimes,
} from "$lib/server/analytics";
import {
    historyMetrics,
    type HistoryMetric,
} from "$lib/components/ServerHistoryCard.svelte";

export const load = (async ({ params, setHeaders }) => {
    const metric = params.chart as HistoryMetric;
    if (!historyMetrics.includes(metric)) error(404, "Chart not found.");

    const server = await db.query.serverTable.findFirst({
        where: eq(serverTable.id, Number(params.server)),
        columns: { id: true, name: true, rank: true },
    });
    if (!server) error(404, "Server listing not found.");

    const [history, uptimes] = await Promise.all([
        getServerHistory(server.id),
        getUptimes([server.id]),
    ]);

    setHeaders({ "Cache-Control": "public, max-age=300" });
    return {
        metric,
        server,
        history,
        historyDays: ANALYTICS_DAYS,
        uptime: uptimes.get(server.id) ?? null,
    };
}) satisfies PageServerLoad;
