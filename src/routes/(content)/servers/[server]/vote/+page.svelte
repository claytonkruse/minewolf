<script lang="ts">
    import type { PageData } from "./$types";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { browser } from "$app/environment";
    import * as Form from "$lib/components/ui/form";
    import { Turnstile } from "svelte-turnstile";
    import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY as turnstilePubKey } from "$env/static/public";
    import { superForm } from "sveltekit-superforms";

    let { data }: { data: PageData } = $props();
    let { server, form: validationForm } = data;

    const form = superForm(validationForm);
    const { form: formData, enhance } = form;

    if (browser) {
        $formData.voteUsername =
            localStorage.getItem("minecraft_username") || "";
    }

    function onsubmit() {
        localStorage.setItem("minecraft_username", $formData.voteUsername);
    }
</script>

<div class="mx-auto max-w-lg">
    <h1 class="text-2xl font-bold">Cast your vote for {server.name}?</h1>
    <br />
    <form method="POST" class="text-left" {onsubmit} use:enhance>
        <Form.Field {form} name="voteUsername">
            <Form.Control>
                {#snippet children({ props })}
                    <label class="text-sm" for="voteUsername">
                        Minecraft Username
                    </label>
                    <div class="flex gap-1">
                        <Input
                            {...props}
                            type="text"
                            bind:value={$formData.voteUsername}
                            placeholder="notch"
                        />
                        <Button type="submit">Vote</Button>
                    </div>
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

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
    </form>

    <nav>
        <ul class="flex justify-between">
            <li>
                <Button
                    variant="link"
                    class="px-0 text-xs text-muted-foreground"
                    href="..">Cancel</Button
                >
            </li>
            <li>
                <Button
                    variant="link"
                    class="px-0 text-xs text-muted-foreground"
                    href="../map/"
                ></Button>
            </li>
        </ul>
    </nav>
</div>
