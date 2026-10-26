<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
    let { data } = $props();
</script>

<Seo
    title="Vote Counted for {data.server!.name} - Minewolf"
    description="Thanks for voting for {data.server!.name} on Minewolf."
    noindex
/>

<h1 class="text-2xl font-bold">Successfully voted for {data.server!.name}!</h1>
<br />
<nav>
    <ul class="flex justify-center gap-2">
        <li>
            <Button variant="outline" href="../../">Back to Server Page</Button>
        </li>
        {#if data.server!.mapUrl}
            <li>
                <Button variant="outline" href="/"
                    >Check out {data.server!.name}'s map!</Button
                >
            </li>
        {/if}
    </ul>
</nav>
