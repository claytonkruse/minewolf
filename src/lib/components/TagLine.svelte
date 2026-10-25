<script lang="ts">
    import { Badge, type BadgeVariant } from "$lib/components/ui/badge";
    import { tagSearchUrl } from "$lib/utils/tagSearchUrl";

    interface Props {
        tags: string[];
        variant?: BadgeVariant;
    }

    let { tags, variant = "secondary" }: Props = $props();

    // Tags are rendered once off-screen to measure them, then as many as fit
    // on one line are shown, followed by a "+n" badge for the rest.
    const GAP = 4;
    let row: HTMLDivElement | undefined = $state();
    let measure: HTMLDivElement | undefined = $state();
    let shown = $state(Infinity);

    function fit() {
        if (!row || !measure) return;
        const available = row.clientWidth;
        const badges = [...measure.children] as HTMLElement[];
        const plusWidth = badges.pop()!.offsetWidth;
        const widths = badges.map((badge) => badge.offsetWidth);

        let count = widths.length;
        while (count > 0) {
            const used =
                widths.slice(0, count).reduce((sum, w) => sum + w, 0) +
                GAP * (count - 1);
            const extra = count < widths.length ? GAP + plusWidth : 0;
            if (used + extra <= available) break;
            count--;
        }
        shown = count;
    }

    $effect(() => {
        tags;
        if (!row) return;
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(row);
        return () => observer.disconnect();
    });
</script>

<div class="relative">
    <div bind:this={row} class="flex gap-1 overflow-hidden">
        {#each tags.slice(0, shown) as tag}
            <Badge {variant} href={tagSearchUrl(tag)}>{tag}</Badge>
        {/each}
        {#if shown < tags.length}
            <Badge variant="outline">+{tags.length - shown}</Badge>
        {/if}
    </div>

    <div
        bind:this={measure}
        class="pointer-events-none invisible absolute top-0 left-0 flex gap-1"
        aria-hidden="true"
    >
        {#each tags as tag}
            <Badge {variant}>{tag}</Badge>
        {/each}
        <Badge variant="outline">+{tags.length}</Badge>
    </div>
</div>
