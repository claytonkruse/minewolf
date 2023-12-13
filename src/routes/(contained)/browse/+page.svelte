<script lang="ts">
	import ServerList from '$lib/components/ServerList.svelte';
	import ServerListing from '$lib/components/ServerListing.svelte';
	import Pagination from './Pagination.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
	$: page = data.page;
</script>

<h1>Browse Minecraft Servers</h1>
<form action="/browse">
	<input type="search" name="q" id="search" />
</form>
<Pagination current_page={page}>
	<ServerList>
		<ServerListing rank="★" name="Sponsor 1" />
		<ServerListing rank="★" name="Sponsor 2" />
		<ServerListing rank="★" name="Sponsor 3" />
		<ServerListing rank="★" name="Sponsor 4" />
		<ServerListing rank="★" name="Sponsor 5" />
		<ServerListing rank="★" name="Sponsor 6" />
		<ServerListing rank="★" name="Sponsor 7" />
		<ServerListing rank="★" name="Sponsor 8" />

		<ServerListing rank="1" name="Minewolf" players="3/350" />
		<ServerListing rank="2" name="CoolServer" />
		<ServerListing rank="4" />
		<ServerListing rank="5" />
		<ServerListing rank="6" />
		<ServerListing rank="7" />
		<ServerListing rank="8" />
		<ServerListing rank="9" />
		<ServerListing rank="10" />
		<ServerListing rank="11" />
		<ServerListing rank="12" />
		<ServerListing rank="13" />
		<ServerListing rank="14" />
		<ServerListing rank="15" />
		<ServerListing rank="16" />
	</ServerList>
</Pagination>

<section>
	<h3>Todo</h3>
	<ol>
		<li>Search via query</li>
		<li>Browse by gamemode</li>
		<li>Browse by version</li>
		<li>Random Server</li>
	</ol>
</section>
