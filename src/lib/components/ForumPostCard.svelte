<script lang="ts">
    import type { Snippet } from "svelte";
    import { Badge } from "$lib/components/ui/badge";
    import ForumPostBody from "$lib/components/ForumPostBody.svelte";
    import { timeAgo } from "$lib/utils/timeAgo";

    interface Props {
        post: {
            id: number;
            body: string;
            createdAt: Date;
            editedAt: Date | null;
            author: { name: string; isAdmin: boolean };
        };
        // Where the timestamp links; defaults to this post's anchor.
        href?: string;
        footer?: Snippet;
    }
    let { post, href = `#post-${post.id}`, footer }: Props = $props();
</script>

<article class="border">
    <header
        class="bg-foreground/5 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-sm"
    >
        <div class="flex items-center gap-2">
            <span class="font-medium">{post.author.name}</span>
            {#if post.author.isAdmin}
                <Badge variant="secondary">Admin</Badge>
            {/if}
        </div>
        <a
            {href}
            class="text-muted-foreground hover:text-foreground text-xs"
            title={post.createdAt.toISOString()}
        >
            {timeAgo(post.createdAt)}
            {#if post.editedAt}(edited){/if}
        </a>
    </header>
    <div class="px-4 py-3">
        <ForumPostBody body={post.body} />
    </div>
    {#if footer}
        <footer class="flex justify-end gap-1 px-2 pb-2">
            {@render footer()}
        </footer>
    {/if}
</article>
