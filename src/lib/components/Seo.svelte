<script lang="ts">
    import { page } from "$app/state";
    import { SITE_NAME, SITE_URL } from "$lib/config";
    import { truncate } from "$lib/utils/plainText";
    import ogImage from "$lib/assets/logo-large.png";

    interface Props {
        title: string;
        description: string;
        // Keeps the page out of search results (accounts, forms, confirmations).
        noindex?: boolean;
        type?: "website" | "article";
    }
    let {
        title,
        description,
        noindex = false,
        type = "website",
    }: Props = $props();

    // Query params that change what the page shows. Anything else
    // (?view=visitor, tracking params) collapses onto the same canonical URL.
    const CANONICAL_PARAMS = ["tag", "page"];

    let url = $derived.by(() => {
        const url = new URL(page.url.pathname, SITE_URL);
        for (const key of CANONICAL_PARAMS) {
            const value = page.url.searchParams.get(key);
            if (value && !(key === "page" && value === "1"))
                url.searchParams.set(key, value);
        }
        return url.href;
    });
    let summary = $derived(truncate(description));
    const image = new URL(ogImage, SITE_URL).href;
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={summary} />
    {#if noindex}
        <meta name="robots" content="noindex" />
    {:else}
        <link rel="canonical" href={url} />
    {/if}

    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:type" content={type} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={summary} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content={SITE_NAME} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={summary} />
    <meta name="twitter:image" content={image} />
</svelte:head>
