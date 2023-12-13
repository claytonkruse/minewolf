<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="container" id="main">
	<article>
		<hgroup>
			<h1>Error {$page.status}</h1>
			<h2>{$page.error?.message}</h2>
		</hgroup>
	</article>
</main>
