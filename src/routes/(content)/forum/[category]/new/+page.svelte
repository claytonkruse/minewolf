<script lang="ts">
    import type { PageData } from "./$types";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import { superForm } from "sveltekit-superforms";
    import { Turnstile } from "svelte-turnstile";
    import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY as turnstilePubKey } from "$env/static/public";

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    let { category, form: superValid } = data;

    let reset = $state<() => void>();
    const form = superForm(superValid, {
        onUpdated() {
            reset?.();
        },
    });
    const { form: formData, enhance, submitting } = form;
</script>

<svelte:head>
    <title>New Thread - {category.name} - Forum - Minewolf</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6 text-left">
    <Breadcrumb.Root>
        <Breadcrumb.List>
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/forum/">Forum</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/forum/{category.slug}/">
                    {category.name}
                </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                <Breadcrumb.Page>New Thread</Breadcrumb.Page>
            </Breadcrumb.Item>
        </Breadcrumb.List>
    </Breadcrumb.Root>

    <h1 class="font-heading text-4xl font-bold">
        New thread in {category.name}
    </h1>

    <form method="POST" use:enhance>
        <Form.Field {form} name="title">
            <Form.Control>
                {#snippet children({ props })}
                    <Form.Label>Title</Form.Label>
                    <Input {...props} bind:value={$formData.title} />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="body">
            <Form.Control>
                {#snippet children({ props })}
                    <Form.Label>Message</Form.Label>
                    <Textarea
                        {...props}
                        bind:value={$formData.body}
                        class="min-h-48"
                    />
                {/snippet}
            </Form.Control>
            <Form.Description>Markdown is supported.</Form.Description>
            <Form.FieldErrors />
        </Form.Field>

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

        <div class="mt-4 flex justify-between">
            <Button variant="outline" href="/forum/{category.slug}/">
                Cancel
            </Button>
            <Form.Button disabled={$submitting}>Post Thread</Form.Button>
        </div>
    </form>
</div>
