<script lang="ts">
    import ServerAddressField from "$lib/components/ServerAddressField.svelte";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { superForm } from "sveltekit-superforms";

    let { form: data } = $props();

    const form = superForm(data, {
        onError({ result }) {
            $message = result.error.message || "Unknown error.";
        },
    });
    const { form: formData, enhance, message, submitting } = form;
</script>

<form method="POST" use:enhance>
    <Form.Field {form} name="name">
        <Form.Control>
            <Form.Label>Name</Form.Label>
            <Input
                name="name"
                bind:value={$formData.name}
                placeholder="Minewolf"
            />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <ServerAddressField {form} />

    {#if $message}
        <p class="text-sm text-destructive">{$message}</p>
    {/if}
    <p class="text-sm text-muted-foreground">
        Please ensure your server is online before you submit.
    </p>
    <Form.Button class="mt-3">
        {#if $submitting}
            Loading...
        {:else}
            Submit
        {/if}
    </Form.Button>
</form>
