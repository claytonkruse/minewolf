<script lang="ts">
    import type { Schema } from "$lib/utils/structuredData";

    let { schemas }: { schemas: Schema[] } = $props();

    // Escaping "<" stops user text from closing the script tag early. The
    // tags are built from pieces because a literal closing script tag here
    // would end this component's own script block.
    const open = '<script type="application/ld+json">';
    const close = "<" + "/script>";
    let json = $derived(
        JSON.stringify({
            "@context": "https://schema.org",
            "@graph": schemas,
        }).replace(/</g, "\\u003c"),
    );
</script>

<svelte:head>
    {@html open + json + close}
</svelte:head>
