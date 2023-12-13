<script lang="ts">
	import ServerList from '$lib/components/ServerList.svelte';
	import ServerListing from '$lib/components/ServerListing.svelte';
</script>

<h1>Minecraft Servers</h1>

<ServerList>
	<ServerListing rank="★" name="Sponsor 1" />
	<ServerListing rank="★" name="Sponsor 2" />
	<ServerListing rank="★" name="Sponsor 3" />

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

<nav>
	<ul><li><a href="/add-server">Add Your Server</a></li></ul>
	<ul><li><a href="/browse">More Servers</a></li></ul>
</nav>
