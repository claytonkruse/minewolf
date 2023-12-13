<script lang="ts">
	import type { PageData } from './$types';
	import ServerEditorForm from '$lib/components/ServerEditorForm.svelte';

	export let data: PageData;
	let { server } = data;
</script>

<h1>Edit {server.name}</h1>
<ServerEditorForm {server} />
