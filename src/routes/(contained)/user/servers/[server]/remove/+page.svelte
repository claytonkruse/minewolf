<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<hgroup>
	<h1>Are you sure you want to remove {data.name}?</h1>
	<h2>Removed servers are permanently deleted.</h2>
</hgroup>
<form method="POST">
	<button type="submit">Remove</button>
</form>
<nav>
	<ul><li><a href="/user/servers/">Cancel</a></li></ul>
</nav>
