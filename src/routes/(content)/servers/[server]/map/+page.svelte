<script lang="ts">
    import type { PageData } from "./$types";
    import { Button } from "$lib/components/ui/button";

    let { data }: { data: PageData } = $props();
    let { server } = data;

    let wrapper: HTMLDivElement;
    import EnterFullscreenIcon from "~icons/mdi/fullscreen";
    import ExitFullscreenIcon from "~icons/mdi/fullscreen-exit";
    import BackIcon from "~icons/material-symbols/arrow-back";

    let fullscreen = $state(false);
    function toggleFullscreen() {
        if (fullscreen) {
            document.exitFullscreen();
            // fullscreen = false; handled by onfullscreenchange listener
        } else {
            wrapper.requestFullscreen();
            fullscreen = true;
        }
    }
</script>

<svelte:document
    onkeydown={({ key }) => {
        if (key === "f") {
            toggleFullscreen();
        }
    }}
    onfullscreenchange={() => {
        if (document.fullscreenElement !== wrapper) {
            fullscreen = false;
        }
    }}
/>

<div class="flex h-full flex-col">
    <div bind:this={wrapper} class="grow">
        {#if fullscreen}
            <Button
                variant="outline"
                class="fixed bottom-2 right-6"
                onclick={toggleFullscreen}
            >
                <ExitFullscreenIcon />
            </Button>
        {/if}
        <iframe
            title={`Map of ${server.name}`}
            src={server.mapUrl}
            frameborder="0"
            width="100%"
            height="100%"
        ></iframe>
    </div>
    <div class="flex h-14 w-full justify-center gap-2 p-2">
        <Button variant="outline" class="absolute left-2" href="../"
            ><BackIcon /> Back to Server Page</Button
        >

        <h1 class="text-xl font-bold">{server.name}'s Map</h1>

        <div class="absolute right-2 flex gap-2">
            <Button
                variant="ghost"
                onclick={toggleFullscreen}
                aria-label="Enter Fullscreen"><EnterFullscreenIcon /></Button
            >
            <Button variant="default" href="../vote/"
                >Vote for {server.name}</Button
            >
        </div>
    </div>
</div>
