<script lang="ts">
    import type { PageData } from "./$types.js";
    import * as Card from "$lib/components/ui/card";
    import AddServerForm from "./AddServerForm.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { form } = data;
</script>

<svelte:head>
    <title>Add Your Server - Minewolf</title>
</svelte:head>

<div class="flex h-full items-center justify-center text-left">
    <Card.Root class="max-w-[400px]">
        <Card.Header>
            <hgroup>
                <h1 class="text-2xl">Add Your Server</h1>
                <h2 class="text-muted-foreground">Get ready for players!</h2>
            </hgroup>
        </Card.Header>
        <Card.Content class="text-left">
            <AddServerForm {form} />
        </Card.Content>
    </Card.Root>
</div>
<!-- <form method="POST" use:enhance>
    <AddServerInput values={form?.data} errors={form?.errors} />
    <p>
        <small
            >Further customization will be availible after the server is posted.</small
        >
    </p>
    <button type="submit">Post</button>
</form> -->
