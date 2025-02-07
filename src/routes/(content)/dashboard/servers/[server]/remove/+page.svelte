<script lang="ts">
    import type { PageData } from "./$types";
    import { Button } from "$lib/components/ui/button";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<svelte:head>
    <title>Remove {data.name}? - Server Dashboard - Minewolf</title>
</svelte:head>

<hgroup>
    <h1 class="text-3xl font-bold">
        Are you sure you want to remove {data.name}?
    </h1>
    <h2 class="text-destructive">Removed servers are permanently deleted.</h2>
</hgroup>

<br />

<form method="POST">
    <Button variant="destructive" type="submit">Remove</Button>
    <Button variant="secondary" href="/dashboard/servers/">Cancel</Button>
</form>
