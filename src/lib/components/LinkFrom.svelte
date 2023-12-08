<script lang="ts">
	import { page } from '$app/stores';
	import localize_url from '$lib/utils/localize_url';

	export let href = '/';
	export let role: string | undefined = undefined;

	$: from = localize_url($page.url.searchParams.get('from') || $page.url);
</script>

<a {role} href={`${href}?from=${from}`}><slot>{href}</slot></a>
