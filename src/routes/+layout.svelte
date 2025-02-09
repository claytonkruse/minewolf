<script lang="ts">
    import type { LayoutProps } from "./$types";
    import "../app.pcss";
    import { beforeNavigate, afterNavigate } from "$app/navigation";
    import { Progress } from "$lib/components/ui/progress";
    import { fade } from "svelte/transition";

    let { children }: LayoutProps = $props();

    function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    let showProg = $state(false);
    let navProg = $state(0);
    let afterNav = true;
    beforeNavigate(async () => {
        afterNav = false;
        navProg = 5;
        await sleep(200);
        navProg = 5;
        if (afterNav) return;
        showProg = true;
        let interval = setInterval(
            () => {
                if (afterNav) clearInterval(interval);
                navProg = (90 - navProg) / 20 + navProg;
            },
            Math.random() * 200 + 32,
        );
    });
    afterNavigate(() => {
        afterNav = true;
        navProg = 100;
        setTimeout(() => {
            showProg = false;
        }, 100);
    });
</script>

{#if showProg}
    <div transition:fade>
        <Progress
            value={navProg}
            class="fixed left-0 top-0 h-[2px] w-full rounded-none bg-transparent"
        />
    </div>
{/if}

<div class="contents text-center">
    {@render children()}
</div>
