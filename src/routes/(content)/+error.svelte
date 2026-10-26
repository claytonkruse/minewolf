<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { page } from "$app/stores";
</script>

<Seo
    title="Error - Minewolf"
    description="An error occurred on this page."
    noindex
/>

<main id="main">
    <article>
        <hgroup>
            <h1>Error {$page.status}</h1>
            <h2>{$page.error?.message}</h2>
        </hgroup>
    </article>
</main>
