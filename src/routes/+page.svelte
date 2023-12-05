<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import ServerList from '$lib/components/ServerList.svelte';
	import ServerListing from '$lib/components/ServerListing.svelte';

	let data;

	onMount(async () => {
		if (browser) {
			const ip = 'minewolf.net';
			data = await (await fetch(`https://api.mcsrvstat.us/3/${ip}`)).json();
		}
	});
</script>

<h1>Servers</h1>

<ServerList>
	<ServerListing name="Minewolf" rank="5" players="3/350" />
</ServerList>

{#if data}
	{data.players.max}
{/if}
