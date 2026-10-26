<script lang="ts">
    import type { PageData } from "./$types";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import * as Form from "$lib/components/ui/form";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import Seo from "$lib/components/Seo.svelte";
    import ForumPostCard from "$lib/components/ForumPostCard.svelte";
    import Pagination, { pageSuffix } from "$lib/components/Pagination.svelte";
    import JsonLd from "$lib/components/JsonLd.svelte";
    import { absoluteUrl, breadcrumbs } from "$lib/utils/structuredData";
    import type { Schema } from "$lib/utils/structuredData";
    import { superForm } from "sveltekit-superforms";
    import { temp_url } from "$lib/utils/redirect_urls";
    import { trackThreadView } from "$lib/utils/trackViews";
    import PinIcon from "@lucide/svelte/icons/pin";
    import LockIcon from "@lucide/svelte/icons/lock";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash-2";

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    let category = $derived(data.category);
    let thread = $derived(data.thread);
    let user = $derived(data.user);
    let canReply = $derived(!!user && (!thread.locked || data.isAdmin));

    // Derived from the id alone so reloading data after an action (pin,
    // reply) doesn't count as another view.
    let threadId = $derived(data.thread.id);
    $effect(() => {
        trackThreadView(threadId);
    });

    let threadPath = $derived(`/forum/${category.slug}/${thread.id}/`);
    let schemas = $derived.by(() => {
        const schemas: Schema[] = [
            breadcrumbs([
                ["Forum", "/forum/"],
                [category.name, `/forum/${category.slug}/`],
                [thread.title, threadPath],
            ]),
        ];
        const opening = data.openingPost;
        if (opening)
            schemas.push({
                "@type": "DiscussionForumPosting",
                headline: thread.title,
                url: absoluteUrl(threadPath),
                datePublished: opening.createdAt,
                text: opening.text,
                author: { "@type": "Person", name: opening.authorName },
                commentCount: data.replyCount,
                interactionStatistic: {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/ViewAction",
                    userInteractionCount: thread.views,
                },
            });
        return schemas;
    });

    const form = superForm(data.form, { resetForm: true });
    const { form: formData, enhance: replyEnhance, submitting } = form;

    // enhance ignores preventDefault from onsubmit, so cancel through it.
    function confirmDelete(isFirstPost: boolean): SubmitFunction {
        return ({ cancel }) => {
            const message = isFirstPost
                ? "Delete this thread and all of its replies?"
                : "Delete this post?";
            if (!confirm(message)) cancel();
        };
    }
</script>

<Seo
    title="{thread.title}{pageSuffix(
        data.page,
    )} - {category.name} - Forum - Minewolf"
    description={data.description}
    type="article"
/>
<JsonLd {schemas} />

<div class="mx-auto max-w-3xl space-y-6 text-left">
    <Breadcrumb.Root>
        <Breadcrumb.List>
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/forum/">Forum</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/forum/{category.slug}/">
                    {category.name}
                </Breadcrumb.Link>
            </Breadcrumb.Item>
        </Breadcrumb.List>
    </Breadcrumb.Root>

    <div class="flex flex-wrap items-start justify-between gap-4">
        <h1 class="font-heading flex items-center gap-2 text-3xl font-bold">
            {#if thread.pinned}
                <PinIcon
                    class="text-primary size-6 shrink-0"
                    aria-label="Pinned"
                />
            {/if}
            {#if thread.locked}
                <LockIcon
                    class="text-muted-foreground size-6 shrink-0"
                    aria-label="Locked"
                />
            {/if}
            <span class="break-words">{thread.title}</span>
        </h1>
        {#if data.isAdmin}
            <div class="flex gap-2">
                <form method="POST" action="?/togglePin" use:enhance>
                    <Button type="submit" variant="outline" size="sm">
                        <PinIcon />
                        {thread.pinned ? "Unpin" : "Pin"}
                    </Button>
                </form>
                <form method="POST" action="?/toggleLock" use:enhance>
                    <Button type="submit" variant="outline" size="sm">
                        <LockIcon />
                        {thread.locked ? "Unlock" : "Lock"}
                    </Button>
                </form>
            </div>
        {/if}
    </div>

    <ol class="space-y-4">
        {#each data.posts as post (post.id)}
            {@const isFirstPost = post.id === data.firstPostId}
            {@const isAuthor = user?.id === post.author.id}
            <li id="post-{post.id}" class="scroll-mt-20">
                {#if isAuthor || data.isAdmin}
                    <ForumPostCard {post}>
                        {#snippet footer()}
                            {#if isAuthor}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    href="./{post.id}/edit/"
                                >
                                    <PencilIcon /> Edit
                                </Button>
                            {/if}
                            <form
                                method="POST"
                                action="?/deletePost"
                                use:enhance={confirmDelete(isFirstPost)}
                            >
                                <input
                                    type="hidden"
                                    name="postId"
                                    value={post.id}
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    class="text-destructive"
                                >
                                    <TrashIcon /> Delete
                                </Button>
                            </form>
                        {/snippet}
                    </ForumPostCard>
                {:else}
                    <ForumPostCard {post} />
                {/if}
            </li>
        {/each}
    </ol>

    <Pagination page={data.page} pageCount={data.pageCount} />

    <section>
        {#if canReply}
            <h2 class="font-heading mb-2 text-xl font-bold">Reply</h2>
            <form method="POST" action="?/reply" use:replyEnhance>
                <Form.Field {form} name="body">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Textarea
                                {...props}
                                bind:value={$formData.body}
                                class="min-h-32"
                                aria-label="Reply"
                            />
                        {/snippet}
                    </Form.Control>
                    <Form.Description>Markdown is supported.</Form.Description>
                    <Form.FieldErrors />
                </Form.Field>
                <div class="mt-2 flex justify-end">
                    <Form.Button disabled={$submitting}>Post Reply</Form.Button>
                </div>
            </form>
        {:else if thread.locked}
            <p class="text-muted-foreground flex items-center gap-2 text-sm">
                <LockIcon class="size-4" /> This thread is locked.
            </p>
        {:else}
            <p class="text-muted-foreground text-sm">
                <a
                    href={temp_url("/login/", page.url)}
                    class="text-foreground underline underline-offset-4"
                    >Log in</a
                > to reply.
            </p>
        {/if}
    </section>
</div>
