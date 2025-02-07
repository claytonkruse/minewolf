<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    let { data } = $props();
    let { name } = data;
</script>

<svelte:head>
    <title>Successfully Removed {name} - Server Dashboard - Minewolf</title>
</svelte:head>

<h1 class="text-2xl font-bold">{name ?? "Server"} removed successfully.</h1>
<Button variant="outline" href="/dashboard/servers/">Return to Servers</Button>
