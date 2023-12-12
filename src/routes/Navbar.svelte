<script lang="ts">
	export let username: string | undefined;
</script>

<nav class="container-fluid">
	<ul>
		<li><a class="uppercase" href="/">Minewolf</a></li>
	</ul>
	<ul>
		<li><a href="/browse">Browse</a></li>
		<li><a href="/about">About</a></li>
		<li><a href="/contact">Contact</a></li>
	</ul>
	<ul>
		<li>
			{#if username}
				<a href="/dashboard">{username}</a>
			{:else}
				<a href="/login">Login</a>
			{/if}
		</li>
	</ul>
</nav>
