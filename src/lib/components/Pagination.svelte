<script lang="ts" module>
    // Keeps paginated pages from sharing one title in search results.
    export function pageSuffix(page: number) {
        return page > 1 ? ` - Page ${page}` : "";
    }
</script>

<script lang="ts">
    import { page as pageState } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    interface Props {
        page: number;
        pageCount: number;
    }
    let { page, pageCount }: Props = $props();

    function pageHref(n: number) {
        const url = new URL(pageState.url);
        if (n === 1) url.searchParams.delete("page");
        else url.searchParams.set("page", String(n));
        url.hash = "";
        return url.pathname + url.search;
    }
</script>

{#if pageCount > 1}
    <nav
        aria-label="Pagination"
        class="flex items-center justify-center gap-2 text-sm"
    >
        <Button
            variant="outline"
            size="icon"
            href={page > 1 ? pageHref(page - 1) : undefined}
            disabled={page <= 1}
            aria-label="Previous page"
        >
            <ChevronLeftIcon />
        </Button>
        <span class="text-muted-foreground">Page {page} of {pageCount}</span>
        <Button
            variant="outline"
            size="icon"
            href={page < pageCount ? pageHref(page + 1) : undefined}
            disabled={page >= pageCount}
            aria-label="Next page"
        >
            <ChevronRightIcon />
        </Button>
    </nav>
{/if}
