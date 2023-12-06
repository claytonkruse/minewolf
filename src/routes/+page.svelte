<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import ServerList from '$lib/components/ServerList.svelte';
	import ServerListing from '$lib/components/ServerListing.svelte';
</script>

<h1>Servers</h1>

<ServerList>
	<ServerListing rank="★" name="Sponsor 1" />
	<ServerListing rank="★" name="Sponsor 2" />
	<ServerListing rank="★" name="Sponsor 3" />

	<ServerListing name="Minewolf" rank="5" players="3/350" />
</ServerList>

<nav>
	<ul></ul>
	<ul><li><a href="/browse" role="button">More Servers</a></li></ul>
</nav>
