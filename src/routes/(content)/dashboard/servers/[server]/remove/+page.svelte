<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";
    import { Button } from "$lib/components/ui/button";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Seo
    title="Remove {data.name}? - Server Dashboard - Minewolf"
    description="Remove the listing for {data.name} from Minewolf."
    noindex
/>

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
