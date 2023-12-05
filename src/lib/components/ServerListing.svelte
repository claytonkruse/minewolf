<script lang="ts">
	export let name: string = 'Undefined Server';
	export let rank: number | string = 0;
	export let online: boolean = false;
	export let players = '0/0';
</script>

<tr>
	<td>{rank}</td>
	<td>
		<a class="name" href="/">{name}</a>
		<p class="tags">tag1, tag2, tag3</p>
	</td>
	<td>Banner</td>
	<td>{players}</td>
	<td>{online ? 'online' : 'offline'}</td>
</tr>

<style lang="scss">
	.name {
		font-size: 1rem;
		margin-bottom: 0.3rem;
	}

	.tags {
		font-size: 0.6rem;
	}

	td {
		vertical-align: baseline;
	}
</style>
