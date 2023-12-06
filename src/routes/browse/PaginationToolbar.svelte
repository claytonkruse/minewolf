<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	let current_page: Writable<number> = getContext('current_page');
	let last_page: Writable<number> = getContext('last_page');

	let pages: Array<number> = [];
	for (let i = 0; i < $last_page; i++) {
		pages = [...pages, i + 1];
	}
</script>

<nav>
	<ul>
		<li><a href={`?p=${(($current_page - 2 + $last_page) % $last_page) + 1}`}>Prev</a></li>
	</ul>
	<ul>
		{#each pages as page}
			<li><a class:current={page == $current_page} href={`?p=${page}`}>{page}</a></li>
		{/each}
	</ul>
	<ul><li><a href={`?p=${($current_page % $last_page) + 1}`}>Next</a></li></ul>
</nav>

<style>
	.current {
		font-weight: bolder;
		color: red;
	}
</style>
