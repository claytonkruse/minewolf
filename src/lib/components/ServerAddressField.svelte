<script lang="ts" generics="T extends Record<string, unknown>">
    import { type SuperForm } from "sveltekit-superforms";

    let {
        form,
        addressField = "address",
        portField = "port",
        addressPlaceholder = "mc.minewolf.net",
        portPlaceholder = "25565",
    }: {
        form: SuperForm<T>;
        addressField?: string;
        portField?: string;
        addressPlaceholder?: string;
        portPlaceholder?: string;
    } = $props();
    const formData = form.form;

    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";

    let portInput: any = $state(null);
    function onAddressInput() {
        console.log("onAddressInput");
        const arr = $formData[addressField].toString().split(":");
        if (arr.length > 1) {
            $formData[addressField] = arr[0];
            $formData[portField] = arr[1];
            portInput.focus();
        }
    }
</script>

<div class="flex gap-2">
    <Form.Field {form} name={addressField} class="grow">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Address</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData[addressField]}
                    placeholder={addressPlaceholder || "mc.minewolf.net"}
                    oninput={onAddressInput}
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name={portField} class="w-[30%]">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Port</Form.Label>
                <Input
                    {...props}
                    bind:value={$formData[portField]}
                    bind:ref={portInput}
                    placeholder={portPlaceholder}
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
</div>
