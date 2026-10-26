<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import Pagination, { pageSuffix } from "$lib/components/Pagination.svelte";
    import JsonLd from "$lib/components/JsonLd.svelte";
    import { breadcrumbs } from "$lib/utils/structuredData";
    import { temp_url } from "$lib/utils/redirect_urls";
    import { timeAgo } from "$lib/utils/timeAgo";
    import PinIcon from "@lucide/svelte/icons/pin";
    import LockIcon from "@lucide/svelte/icons/lock";
    import PlusIcon from "@lucide/svelte/icons/plus";

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    let category = $derived(data.category);
    let newThreadHref = $derived(
        data.user
            ? `/forum/${category.slug}/new/`
            : temp_url("/login/", `/forum/${category.slug}/new/`),
    );
</script>

<Seo
    title="{category.name}{pageSuffix(data.page)} - Forum - Minewolf"
    description={category.description}
/>
<JsonLd
    schemas={[
        breadcrumbs([
            ["Forum", "/forum/"],
            [category.name, `/forum/${category.slug}/`],
        ]),
    ]}
/>

<div class="mx-auto max-w-3xl space-y-6 text-left">
    <Breadcrumb.Root>
        <Breadcrumb.List>
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/forum/">Forum</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Page>{category.name}</Breadcrumb.Page>
            </Breadcrumb.Item>
        </Breadcrumb.List>
    </Breadcrumb.Root>

    <div class="flex flex-wrap items-end justify-between gap-4">
        <hgroup>
            <h1 class="font-heading text-4xl font-bold">{category.name}</h1>
            <p class="text-muted-foreground">{category.description}</p>
        </hgroup>
        <Button href={newThreadHref}><PlusIcon /> New Thread</Button>
    </div>

    {#if data.threads.length === 0}
        <p class="text-muted-foreground border p-8 text-center">
            No threads yet. Start the conversation!
        </p>
    {:else}
        <ul class="divide-y border">
            {#each data.threads as thread}
                <li>
                    <a
                        href="/forum/{category.slug}/{thread.id}/"
                        class="hover:bg-foreground/5 flex items-center gap-4 px-4 py-3 transition-colors"
                    >
                        <div class="min-w-0 grow">
                            <p class="flex items-center gap-1.5 font-medium">
                                {#if thread.pinned}
                                    <PinIcon
                                        class="text-primary size-4 shrink-0"
                                        aria-label="Pinned"
                                    />
                                {/if}
                                {#if thread.locked}
                                    <LockIcon
                                        class="text-muted-foreground size-4 shrink-0"
                                        aria-label="Locked"
                                    />
                                {/if}
                                <span class="truncate">{thread.title}</span>
                            </p>
                            <p class="text-muted-foreground text-xs">
                                by {thread.authorName} · {timeAgo(
                                    thread.createdAt,
                                )}
                            </p>
                        </div>
                        <div
                            class="text-muted-foreground shrink-0 text-right text-xs"
                        >
                            <p>
                                {thread.replyCount}
                                {thread.replyCount === 1 ? "reply" : "replies"}
                            </p>
                            <p>{timeAgo(thread.lastPostAt)}</p>
                        </div>
                    </a>
                </li>
            {/each}
        </ul>
    {/if}

    <Pagination page={data.page} pageCount={data.pageCount} />
</div>
