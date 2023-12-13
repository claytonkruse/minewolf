<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	let tooltip: string = 'Copy IP?';

	export let data: PageData;
	let { ip, port, name, slogan, description, website, dynmap, discord, version } = data;

	let api_data: any;
	onMount(async () => {
		if (browser) {
			api_data = await (await fetch(`https://api.mcsrvstat.us/3/${ip}`)).json();
		}
	});

	async function copy_ip() {
		await navigator.clipboard.writeText(ip || '69');
		tooltip = 'Copied.';
		setTimeout(() => (tooltip = 'Copy again?'), Math.pow(8, 4));
	}
</script>

<aside>
	<table>
		<tr>
			<th>Rank</th>
			<td>3</td>
		</tr>
		<tr>
			<th>IP</th>
			<td>{ip}</td>
		</tr>
		{#if port}
			<tr>
				<th>Port</th>
				<td>{port}</td>
			</tr>
		{/if}
		<tr>
			<th>Version</th>
			<td>{version}</td>
		</tr>
		<tr>
			<th>Votes</th>
			<td>321</td>
		</tr>
		<tr>
			<th>Players</th>
			<td>12/23</td>
		</tr>
		<tr>
			<th>Uptime</th>
			<td>100%</td>
		</tr>
	</table>
</aside>

<hgroup>
	<h1>{name}</h1>
	<h2>{slogan}</h2>
</hgroup>

<img class="banner" src="/banner.png" alt="" />

<nav aria-label="breadcrumb">
	<ul>
		<li><a href={website}>Website</a></li>
		<li><a href={dynmap}>Dynmap</a></li>
		<li><a href={discord}>Discord</a></li>
		<li><a href="vote">Vote for this Server</a></li>
	</ul>
</nav>

<button
	type="button"
	class="unstyled"
	on:click={copy_ip}
	data-tooltip={tooltip}
	data-placement="bottom"
>
	<code>{ip}</code>
</button>
{#if api_data}
	<section>
		{#if api_data.version}
			<div>Minecraft Version {api_data.version}</div>
		{/if}
		{#if api_data.players}
			<div>{api_data.players.online}/{api_data.players.max} players online</div>
		{/if}
	</section>
	<article class="game-listing">
		{#if api_data.icon}
			<figure>
				<img src={api_data.icon} alt="" />
			</figure>
		{/if}
		{#if api_data.motd}
			<code>
				{@html api_data.motd.html[0]}<br />
				{@html api_data.motd.html[1]}
			</code>
		{/if}
	</article>
{/if}
<section>
	<p>{description}</p>
</section>

<section class="tag-group">
	<div class="tag gamemode">Survival</div>
	<div class="tag gamemode">Creative</div>
	{#if api_data}
		{#if api_data.plugins}
			{#each api_data.plugins as plugin}
				<span class="tag plugin">{plugin.name}</span>{' '}
			{/each}
		{/if}
	{/if}
</section>

<style lang="scss">
	hgroup,
	h2 {
		margin-bottom: 0;
	}

	.banner {
		margin-top: 1rem;
	}

	h2 {
		font-size: 1rem;
	}

	section {
		margin-bottom: 1.2rem;
	}

	.game-listing {
		all: unset;
		display: flex;
		code {
			font-size: 1em;
			height: 100%;
		}
		// border: 1px dotted red;
	}

	aside {
		float: right;
	}
</style>
