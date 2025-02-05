<script lang="ts">
    import type { PageData } from "./$types";
    import { Button } from "$lib/components/ui/button";

    let { data }: { data: PageData } = $props();
    let { server } = data;
</script>

<div class="flex h-full flex-col">
    <div class="grow">
        <iframe
            title={`Map of ${server.name}`}
            src={server.mapUrl}
            frameborder="0"
            width="100%"
            height="100%"
        ></iframe>
    </div>
    <div class="flex w-full justify-between gap-2 p-2">
        <Button variant="outline" href="../">Back to Server Page</Button>

        <h1 class="text-xl font-bold">{server.name}'s Map</h1>

        <Button variant="default" href="../vote/">Vote for {server.name}</Button
        >
    </div>
</div>
