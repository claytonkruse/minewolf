<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	$: ({ servers } = data);
</script>

<section>
	<h2>My Servers</h2>
	<table>
		<thead>
			<tr>
				<th>Rank</th>
				<th>Server</th>
				<th>Actions</th>
			</tr>
		</thead>
		{#each servers as server}
			<td>1</td>
			<td><a href={`/user/servers/${server.id}/`}>{server.name}</a></td>
			<td>
				<nav>
					<ul>
						<li><a href={`/servers/${server.id}/`}>View</a></li>
						<li><a href={`/user/servers/${server.id}/edit/`}>Edit</a></li>
						<li><a href={`/user/servers/${server.id}/remove/`}>Remove</a></li>
					</ul>
				</nav>
			</td>
		{/each}
	</table>
</section>
