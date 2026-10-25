import type { ViewKind } from "$lib/server/db/drizzle/schema";

// Called from the browser (not load functions) so hover preloads aren't counted.
export function trackViews(kind: ViewKind, serverIds: number[]) {
    if (serverIds.length === 0) return;
    fetch("/api/views/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, serverIds }),
        keepalive: true,
    }).catch(() => {});
}
