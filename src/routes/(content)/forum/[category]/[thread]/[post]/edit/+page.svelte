<script lang="ts">
    import type { PageData } from "./$types";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import { superForm } from "sveltekit-superforms";

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    let { category, thread, isFirstPost } = data;

    const form = superForm(data.form);
    const { form: formData, enhance, submitting } = form;
</script>

<svelte:head>
    <title>Edit Post - {thread.title} - Forum - Minewolf</title>
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
                <Breadcrumb.Link href="/forum/{category.slug}/{thread.id}/">
                    {thread.title}
                </Breadcrumb.Link>
            </Breadcrumb.Item>
        </Breadcrumb.List>
    </Breadcrumb.Root>

    <h1 class="font-heading text-4xl font-bold">Edit post</h1>

    <form method="POST" use:enhance>
        {#if isFirstPost}
            <Form.Field {form} name="title">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Title</Form.Label>
                        <Input {...props} bind:value={$formData.title} />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
        {/if}

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

        <div class="mt-4 flex justify-between">
            <Button
                variant="outline"
                href="/forum/{category.slug}/{thread.id}/"
            >
                Cancel
            </Button>
            <Form.Button disabled={$submitting}>Save</Form.Button>
        </div>
    </form>
</div>
