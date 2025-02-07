<script lang="ts">
    import { page } from "$app/stores";
</script>

<svelte:head>
    <title>Error - Minewolf</title>
    <meta name="description" content="An error occurred on this page." />
</svelte:head>

<main id="main">
    <article>
        <hgroup>
            <h1>Error {$page.status}</h1>
            <h2>{$page.error?.message}</h2>
        </hgroup>
    </article>
</main>
