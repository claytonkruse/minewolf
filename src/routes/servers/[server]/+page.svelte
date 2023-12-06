<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let ip: string = 'minewolf.net';
	let tooltip: string = 'Copy IP?';

	let data: any;
	onMount(async () => {
		if (browser) {
			data = await (await fetch(`https://api.mcsrvstat.us/3/${ip}`)).json();
		}
	});

	async function copy_ip() {
		await navigator.clipboard.writeText(ip);
		tooltip = 'Copied.';
		setTimeout(() => {
			tooltip = 'Copy again?';
		}, 8888);
	}
</script>

<hgroup>
	<h1>Minewolf</h1>
	<h2>The best Minecraft server that there ever was.</h2>
</hgroup>
<img class="banner" src="/banner.png" alt="" />
<nav aria-label="breadcrumb">
	<ul>
		<li><a href="/">Website</a></li>
		<li><a href="/">Dynmap</a></li>
		<li><a href="/">Discord</a></li>
		<li><a href="vote">Vote for this Server</a></li>
	</ul>
</nav>
<span on:click={copy_ip} data-tooltip={tooltip} data-placement="bottom"><code>{ip}</code></span>
{#if data}
	<section>
		{#if data.version}
			<div>Minecraft Version {data.version}</div>
		{/if}
		{#if data.players}
			<div>{data.players.online}/{data.players.max} players online</div>
		{/if}
	</section>
	<section>
		<div class="game-listing">
			{#if data.icon}
				<img src={data.icon} alt="" />
			{/if}
			{#if data.motd}
				<code>
					{@html data.motd.html[0]}<br />
					{@html data.motd.html[1]}
				</code>
			{/if}
		</div>
	</section>
{/if}
<section>
	<p>
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum excepturi illo quas sint,
		laudantium, eaque odit aliquam eum repellendus voluptatem necessitatibus quis sequi quod
		accusantium. Dignissimos culpa voluptatem dolor ut eius voluptate odit nesciunt reprehenderit!
		Sed temporibus, quo repudiandae nisi quasi esse fugiat nihil quia iusto at quam, perspiciatis
		assumenda cum nobis cupiditate soluta maiores natus! Ipsa a accusamus modi!
	</p>
</section>
{#if data}
	{#if data.plugins}
		<section>
			<h2>Plugins</h2>
			<div class="tag-group">
				{#each data.plugins as plugin}
					<span class="tag">{plugin.name}</span>{' '}
				{/each}
			</div>
		</section>
	{/if}
{/if}
<section>
	<h2>Tags</h2>
	<div class="tag-group">
		<div class="tag">survival</div>
		<div class="tag">creative</div>
	</div>
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
		height: 3rem;
		img {
			vertical-align: top;
			height: 100%;
		}
		code {
			font-size: 1em;
		}
		// border: 1px dotted red;
	}
</style>
