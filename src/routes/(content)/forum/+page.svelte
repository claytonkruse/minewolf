<script lang="ts">
    import type { PageData } from "./$types";
    import { getForumCategory } from "$lib/forum";
    import { timeAgo } from "$lib/utils/timeAgo";
    import { Button } from "$lib/components/ui/button";
    import ForumPostCard from "$lib/components/ForumPostCard.svelte";
    import MessagesIcon from "@lucide/svelte/icons/messages-square";
    import MessageIcon from "@lucide/svelte/icons/message-square";
    import PinIcon from "@lucide/svelte/icons/pin";

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
</script>

<svelte:head>
    <title>Forum - Minewolf</title>
    <meta
        name="description"
        content="Talk Minecraft servers with the Minewolf community."
    />
</svelte:head>

<div
    class="mx-auto flex max-w-full flex-col gap-12 text-left lg:gap-4 xl:flex-row xl:items-start"
    data-fit-panel
    data-panels
>
    <div class="flex w-2xl max-w-full flex-col gap-12 lg:gap-4">
        <section class="lg:panel space-y-6">
            <hgroup>
                <h1 class="font-heading text-4xl font-bold">Forum</h1>
                <p class="text-muted-foreground">
                    Talk Minecraft servers with the Minewolf community.
                </p>
            </hgroup>

            <ul class="divide-y border">
                {#each data.categories as category}
                    <li>
                        <a
                            href="/forum/{category.slug}/"
                            class="hover:bg-foreground/5 flex items-center gap-4 p-4 transition-colors"
                        >
                            <MessagesIcon
                                class="text-muted-foreground size-6 shrink-0"
                            />
                            <div class="min-w-0 grow">
                                <h2 class="font-heading text-lg font-bold">
                                    {category.name}
                                </h2>
                                <p class="text-muted-foreground text-sm">
                                    {category.description}
                                </p>
                            </div>
                            <div
                                class="text-muted-foreground shrink-0 text-right text-xs"
                            >
                                <p>
                                    {category.threadCount}
                                    {category.threadCount === 1
                                        ? "thread"
                                        : "threads"}
                                </p>
                                {#if category.lastPostAt}
                                    <p>Active {timeAgo(category.lastPostAt)}</p>
                                {/if}
                            </div>
                        </a>
                    </li>
                {/each}
            </ul>
        </section>

        {#if data.rulesPost}
            {@const rules = data.rulesPost}
            {@const threadHref = `/forum/${rules.category}/${rules.threadId}/`}
            <section class="lg:panel space-y-3">
                <div>
                    <p
                        class="text-muted-foreground flex items-center gap-1.5 text-xs"
                    >
                        <PinIcon class="text-primary size-3.5" />
                        Pinned in
                        <a
                            href="/forum/{rules.category}/"
                            class="hover:text-foreground underline-offset-4 hover:underline"
                        >
                            {getForumCategory(rules.category)?.name ??
                                rules.category}
                        </a>
                    </p>
                    <h2 class="font-heading text-xl font-bold">
                        <a
                            href={threadHref}
                            class="underline-offset-4 hover:underline"
                        >
                            {rules.title}
                        </a>
                    </h2>
                </div>
                <ForumPostCard
                    post={rules.post}
                    href="{threadHref}#post-{rules.post.id}"
                >
                    {#snippet footer()}
                        <Button variant="ghost" size="sm" href={threadHref}>
                            <MessageIcon />
                            {rules.replyCount}
                            {rules.replyCount === 1 ? "reply" : "replies"} · View
                            thread
                        </Button>
                    {/snippet}
                </ForumPostCard>
            </section>
        {/if}
    </div>

    <aside class="flex w-2xl max-w-full flex-col gap-12 lg:gap-4 xl:w-80">
        <section class="lg:panel">
            <h2 class="font-heading mb-2 text-xl font-bold">Recent</h2>
            {#if data.recentActivity.length}
                <ul class="divide-y border">
                    {#each data.recentActivity as post (post.postId)}
                        <li>
                            <a
                                href="/forum/{post.category}/{post.threadId}/"
                                class="hover:bg-foreground/5 block px-3 py-2 transition-colors"
                            >
                                <p class="line-clamp-2 text-sm font-medium">
                                    {post.title}
                                </p>
                                <p class="text-muted-foreground mt-1 text-xs">
                                    <span class="text-foreground"
                                        >{post.kind}</span
                                    >
                                    by {post.authorName} · {timeAgo(
                                        post.activityAt,
                                    )}
                                </p>
                                <p class="text-muted-foreground text-xs">
                                    {getForumCategory(post.category)?.name ??
                                        post.category}
                                </p>
                            </a>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-muted-foreground border p-4 text-sm">
                    No posts yet.
                </p>
            {/if}
        </section>

        {#if data.topThreads.length}
            <section class="lg:panel">
                <h2 class="font-heading mb-2 text-xl font-bold">Top</h2>
                <ul class="divide-y border">
                    {#each data.topThreads as thread (thread.id)}
                        <li>
                            <a
                                href="/forum/{thread.category}/{thread.id}/"
                                class="hover:bg-foreground/5 block px-3 py-2 transition-colors"
                            >
                                <p class="line-clamp-2 text-sm font-medium">
                                    {thread.title}
                                </p>
                                <p class="text-muted-foreground mt-1 text-xs">
                                    <span class="text-foreground">
                                        {thread.views.toLocaleString("en-US")}
                                        {thread.views === 1 ? "view" : "views"}
                                    </span>
                                    · {thread.authorName}
                                </p>
                                <p class="text-muted-foreground text-xs">
                                    {getForumCategory(thread.category)?.name ??
                                        thread.category}
                                </p>
                            </a>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}
    </aside>
</div>
