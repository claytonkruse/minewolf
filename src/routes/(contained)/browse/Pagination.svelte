<script lang="ts">
	import { setContext } from 'svelte';
	import PaginationToolbar from './PaginationToolbar.svelte';
	import { writable } from 'svelte/store';

	export let current_page: number = 1;
	export let last_page: number = 10;

	const w_current_page = writable();
	$: w_current_page.set(current_page);

	const w_last_page = writable();
	$: w_last_page.set(last_page);

	setContext('current_page', w_current_page);
	setContext('last_page', w_last_page);
</script>

<PaginationToolbar />
<slot />
<PaginationToolbar />

<style lang="scss">
</style>
