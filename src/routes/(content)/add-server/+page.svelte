<script lang="ts">
    import type { PageData } from "./$types.js";
    import { Input } from "$lib/components/ui/input";
    import * as Form from "$lib/components/ui/form";
    import ServerAddressField from "$lib/components/ServerAddressField.svelte";
    import { superForm } from "sveltekit-superforms";
    import { Turnstile } from "svelte-turnstile";
    import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY as turnstilePubKey } from "$env/static/public";
    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { form: superValid } = data;

    let reset = $state<() => void>();
    const form = superForm(superValid, {
        onUpdated() {
            reset?.();
        },
    });
    const { form: formData, enhance, submitting } = form;
</script>

<svelte:head>
    <title>Add Your Server - Minewolf</title>
</svelte:head>

{#snippet AddServerForm()}
    <form method="POST" use:enhance>
        <Form.Field {form} name="name">
            <Form.Control>
                {#snippet children({ props })}
                    <Form.Label for="name">Server Name</Form.Label>
                    <Input
                        {...props}
                        bind:value={$formData.name}
                        placeholder="Minewolf"
                    />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

        <ServerAddressField {form} />

        <p class="text-muted-foreground text-sm">
            Please ensure your server is online before you submit.
        </p>

        <Form.Field {form} name="cf-turnstile-response">
            <Form.Control>
                {#snippet children({ props })}
                    <Turnstile
                        class="mt-3"
                        siteKey={turnstilePubKey}
                        bind:reset
                    />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

        <Form.Button class="mt-3">
            {#if $submitting}
                Loading...
            {:else}
                Submit
            {/if}
        </Form.Button>
    </form>
{/snippet}

<div class="mx-auto w-md max-w-full text-left" data-fit-panel>
    <hgroup>
        <h1 class="font-heading text-4xl font-bold">Add Your Server</h1>
        <p class="text-muted-foreground mt-3 text-lg">Get ready for players!</p>
    </hgroup>
    <div class="mt-8">
        {@render AddServerForm()}
    </div>
</div>
