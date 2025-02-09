<script lang="ts">
    import type { PageData } from "./$types.js";
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import ServerAddressField from "$lib/components/ServerAddressField.svelte";
    import { superForm } from "sveltekit-superforms";
    import { Turnstile } from "svelte-turnstile";
    import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY as turnstilePubKey } from "$env/static/public";
    import { page } from "$app/state";
    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { form: superValid } = data;

    const form = superForm(superValid, {
        onError({ result }) {
            $message = result.error.message || "Unknown error.";
        },
    });
    const { form: formData, enhance, message, submitting } = form;
</script>

<svelte:head>
    <title>Add Your Server - Minewolf</title>
</svelte:head>

{#snippet AddServerForm()}
    <form method="POST" use:enhance>
        <Form.Field {form} name="name">
            <Form.Control>
                {#snippet children({ props })}
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

        {#if $message}
            <p class="text-sm text-destructive">{$message}</p>
        {/if}
        <p class="text-sm text-muted-foreground">
            Please ensure your server is online before you submit.
        </p>

        <Form.Field {form} name="turnstileResponse">
            <Form.Control>
                {#snippet children({ props })}
                    <Turnstile
                        class="mt-3"
                        responseFieldName={props.name}
                        siteKey={turnstilePubKey}
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

<div class="flex h-full items-center justify-center text-left">
    <Card.Root class="max-w-[400px]">
        <Card.Header>
            <hgroup>
                <h1 class="text-2xl">Add Your Server</h1>
                <h2 class="text-muted-foreground">Get ready for players!</h2>
            </hgroup>
        </Card.Header>
        <Card.Content class="text-left">
            {@render AddServerForm()}
        </Card.Content>
    </Card.Root>
</div>
