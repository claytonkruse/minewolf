<script lang="ts" module>
    // Keeps paginated pages from sharing one title in search results.
    export function pageSuffix(page: number) {
        return page > 1 ? ` - Page ${page}` : "";
    }
</script>

<script lang="ts">
    import { page as pageState } from "$app/state";
    import * as Pagination from "$lib/components/ui/pagination";
    import { cn } from "$lib/utils";
    import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    interface Props {
        page: number;
        pageCount: number;
        class?: string;
    }
    let { page, pageCount, class: className }: Props = $props();

    // Keeps the current query (search, filters) and only swaps the page.
    function pageHref(n: number) {
        const url = new URL(pageState.url);
        if (n === 1) url.searchParams.delete("page");
        else url.searchParams.set("page", String(n));
        url.hash = "";
        return url.pathname + url.search;
    }

    // Controls are real links so pages can be crawled, opened in a new tab
    // and used without JavaScript. Disabled ends render without an href.
    const disabledLink = "pointer-events-none opacity-50";

    // bits-ui renders these controls as buttons; drop the button-only attributes.
    function linkProps(props: Record<string, unknown>) {
        const { type: _type, disabled: _disabled, ...rest } = props;
        return rest;
    }
</script>

{#if pageCount > 1}
    <Pagination.Root
        count={pageCount}
        perPage={1}
        {page}
        siblingCount={1}
        class={className}
    >
        {#snippet children({ pages, currentPage })}
            <Pagination.Content class="flex-wrap justify-center">
                <Pagination.Item>
                    <Pagination.Previous>
                        {#snippet child({ props })}
                            <a
                                {...linkProps(props)}
                                href={page > 1 ? pageHref(page - 1) : undefined}
                                aria-disabled={page <= 1}
                                class={cn(
                                    props.class as string,
                                    page <= 1 && disabledLink,
                                )}
                            >
                                <ChevronLeftIcon data-icon="inline-start" />
                                <span class="hidden sm:block">Previous</span>
                            </a>
                        {/snippet}
                    </Pagination.Previous>
                </Pagination.Item>

                {#each pages as p (p.key)}
                    <Pagination.Item>
                        {#if p.type === "ellipsis"}
                            <Pagination.Ellipsis />
                        {:else}
                            <Pagination.Link
                                page={p}
                                isActive={currentPage === p.value}
                            >
                                {#snippet child({ props })}
                                    <a
                                        {...linkProps(props)}
                                        href={pageHref(p.value)}
                                    >
                                        {p.value}
                                    </a>
                                {/snippet}
                            </Pagination.Link>
                        {/if}
                    </Pagination.Item>
                {/each}

                <Pagination.Item>
                    <Pagination.Next>
                        {#snippet child({ props })}
                            <a
                                {...linkProps(props)}
                                href={page < pageCount
                                    ? pageHref(page + 1)
                                    : undefined}
                                aria-disabled={page >= pageCount}
                                class={cn(
                                    props.class as string,
                                    page >= pageCount && disabledLink,
                                )}
                            >
                                <span class="hidden sm:block">Next</span>
                                <ChevronRightIcon data-icon="inline-end" />
                            </a>
                        {/snippet}
                    </Pagination.Next>
                </Pagination.Item>
            </Pagination.Content>
        {/snippet}
    </Pagination.Root>
{/if}
