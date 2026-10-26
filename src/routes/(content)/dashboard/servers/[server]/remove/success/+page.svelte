<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
    let { data } = $props();
    let { name } = data;
</script>

<Seo
    title="Successfully Removed {name} - Server Dashboard - Minewolf"
    description="The server listing was removed from Minewolf."
    noindex
/>

<h1 class="text-2xl font-bold">{name ?? "Server"} removed successfully.</h1>
<Button variant="outline" href="/dashboard/servers/">Return to Servers</Button>
