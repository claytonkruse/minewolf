<script lang="ts">
    import ServerAddressField from "$lib/components/ServerAddressField.svelte";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { superForm } from "sveltekit-superforms";
    import { Button } from "$lib/components/ui/button";
    import Banner from "$lib/components/Banner.svelte";
    import { PUBLIC_DISCORD_INVITE } from "$env/static/public";
    import { getImageURL } from "$lib/utils/getImageUrl.js";

    let { data } = $props();
    let { server } = data;

    const form = superForm(data.form, {
        onError({ result }) {
            $message = result.error.message || "Unknown error.";
        },
    });
    const { form: formData, enhance, message, submitting } = form;

    let newBannerUrl: string | undefined = $state();
</script>

<svelte:head>
    <title>Edit {server.name} - Minewolf</title>
</svelte:head>

<h1 class="text-2xl font-bold">Edit {server.name}</h1>

<form
    method="POST"
    enctype="multipart/form-data"
    class="m-auto w-fit text-left"
    use:enhance
>
    <Form.Field {form} name="name">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Name</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData.name}
                    placeholder="Minewolf"
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="description">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Description</Form.Label>
                <Textarea
                    {...props}
                    bind:value={$formData.description}
                    placeholder="A description of the server"
                    rows={8}
                    class="resize-none"
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="bannerFile">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>
                    <div class="mb-2 inline-block">Banner</div>
                    <br />

                    {#if newBannerUrl || server.bannerUrl}
                        <Banner
                            alt="Current Banner"
                            src={newBannerUrl || server.bannerUrl}
                        />
                    {/if}

                    <input
                        {...props}
                        class="mt-1"
                        type="file"
                        accept="image/*"
                        onchange={async ({ target }) => {
                            const input = target as HTMLInputElement;
                            if (!input.files) return;
                            const file = input.files[0];
                            if (file) newBannerUrl = await getImageURL(file);
                        }}
                    />
                </Form.Label>
            {/snippet}
        </Form.Control>

        <Form.FieldErrors />
    </Form.Field>

    <br />

    <h3 class="mb-2 text-xl font-bold">Java Edition Info</h3>
    <ServerAddressField {form} />
    <br />

    <h3 class="mb-2 text-xl font-bold">Bedrock Edition Info</h3>
    <ServerAddressField
        {form}
        addressField="bedrockAddress"
        portField="bedrockPort"
        addressPlaceholder={$formData.address}
        portPlaceholder="19132"
    />
    <br />

    <h3 class="mb-2 text-xl font-bold" id="votifier">Votifier Info</h3>
    <Form.Field {form} name="votifierEnabled">
        <Form.Control>
            {#snippet children({ props })}
                <div class="flex items-center gap-2">
                    <Checkbox
                        {...props}
                        bind:checked={$formData.votifierEnabled}
                    />
                    <Form.Label>Enable Votifier</Form.Label>
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <ServerAddressField
        {form}
        addressField="votifierAddress"
        portField="votifierPort"
        addressPlaceholder={$formData.address}
        portPlaceholder="8192"
    />
    <Form.Field {form} name="votifierKey">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Public Key</Form.Label>
                <br />

                <Textarea
                    {...props}
                    bind:value={$formData.votifierKey}
                    placeholder="The contents of your 'public.key' file."
                    rows={3}
                    class="resize-none"
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <br />

    <h3 class="mb-2 text-xl font-bold">Links</h3>

    <Form.Field {form} name="website">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Website</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData.website}
                    placeholder="https://minewolf.net/"
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="discord">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Discord</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData.discord}
                    placeholder={PUBLIC_DISCORD_INVITE}
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="mapUrl">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Map</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData.mapUrl}
                    placeholder="https://dynmap.minewolf.net/"
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="video">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>YouTube Video</Form.Label>
                <Input
                    {...props}
                    name="video"
                    bind:value={$formData.video}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
                <!-- Somehow I knew the AI would autofill with that video. -->
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <br />

    <h3 class="mb-2 text-xl font-bold" id="automation">Automation</h3>

    <Form.Field {form} name="autoVersion">
        <Form.Control>
            {#snippet children({ props })}
                <div class="flex items-center gap-2">
                    <Checkbox {...props} bind:checked={$formData.autoVersion} />
                    <Form.Label>Detect Minecraft version(s)</Form.Label>
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <br />

    <h3 class="mb-4 text-xl font-bold">Who Can Connect?</h3>

    <Form.Field {form} name="versionString">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Minecraft Versions</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData.versionString}
                    placeholder="1.8.9"
                    disabled={$formData.autoVersion}
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="whitelisted">
        <Form.Control>
            {#snippet children({ props })}
                <div class="flex items-center space-x-2">
                    <Checkbox {...props} bind:checked={$formData.whitelisted} />
                    <Form.Label>Whitelisted</Form.Label>
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <br />

    <h3 class="text-xl font-bold">Final Info</h3>

    <Form.Field {form} name="tags">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Additional Tags</Form.Label>
                <br />
                <small class="text-muted-foreground"
                    >Some tags will automatically be added to your sever. This
                    is the place for manual tags.</small
                >

                <Textarea
                    {...props}
                    bind:value={$formData.tags}
                    placeholder="A comma separated list of tags: survival, pvp, minigames"
                    rows={3}
                    class="resize-none"
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <br />

    <Button type="submit" disabled={$submitting}>Save Changes</Button>

    <br />
    <br />
</form>
