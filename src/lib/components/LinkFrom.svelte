<script lang="ts">
    import { page } from "$app/stores";
    import localize_url from "$lib/utils/localize_url";

    interface Props {
        href?: string;
        role?: string | undefined;
        children?: import('svelte').Snippet;
    }

    let { href = "/", role = undefined, children }: Props = $props();

    let from = $derived(localize_url($page.url.searchParams.get("from") || $page.url));
</script>

<a {role} href={`${href}?from=${from}`}>{#if children}{@render children()}{:else}{href}{/if}</a>
